// Emissão de vouchers no balcão.
//
// O atendente mete o valor da factura; o sistema calcula quantos vouchers dar
// (pelos escalões), tira-os do lote aprovado do parceiro, e regista a emissão
// para auditoria. Devolve os códigos para o PDF.
//
// Concorrência: dois atendentes a emitir ao mesmo tempo não podem levar o mesmo
// voucher. Usa-se SELECT ... FOR UPDATE SKIP LOCKED para cada um apanhar códigos
// livres sem colisão.

import { transaction } from './db.js';
import { entradasParaValor, CONFIG } from './config.js';

export class EmissaoError extends Error {
  constructor(code, httpStatus, extra = {}) {
    super(code);
    this.code = code;
    this.httpStatus = httpStatus;
    this.extra = extra;
  }
}

/**
 * Emite vouchers para uma venda.
 * @param {object} input
 * @param {string} input.parceiroId
 * @param {number} input.valorFactura  em MZN
 * @param {string} [input.facturaRef]  nº de factura / descrição
 * @param {string} [input.atendente]   quem está no balcão
 * @returns {Promise<{emissao_id, n_vouchers, codigos: string[], valor, restante_lote}>}
 */
export async function emitirVouchers(input) {
  const valor = Math.floor(Number(input.valorFactura));
  if (!Number.isFinite(valor) || valor <= 0) {
    throw new EmissaoError('valor_invalido', 422);
  }
  if (valor < CONFIG.VALOR_MINIMO_MZN) {
    throw new EmissaoError('abaixo_minimo', 422, { minimo: CONFIG.VALOR_MINIMO_MZN });
  }

  const nVouchers = entradasParaValor(valor); // 1, 3 ou 5
  if (nVouchers < 1) throw new EmissaoError('abaixo_minimo', 422, { minimo: CONFIG.VALOR_MINIMO_MZN });

  return transaction(async (c) => {
    // 1. encontrar um lote aprovado do parceiro com códigos ainda por emitir
    const codigos = await c.query(
      `SELECT co.id, co.codigo, co.lote_id
         FROM codigo co
         JOIN lote l ON l.id = co.lote_id
        WHERE co.parceiro_id = $1
          AND co.estado = 'por_activar'
          AND co.emissao_id IS NULL
          AND l.estado = 'aprovado'
        ORDER BY co.id
        FOR UPDATE OF co SKIP LOCKED
        LIMIT $2`,
      [input.parceiroId, nVouchers]
    );

    if (codigos.rowCount < nVouchers) {
      throw new EmissaoError('lote_esgotado', 409, {
        disponiveis: codigos.rowCount,
        pedidos: nVouchers,
      });
    }

    const loteId = codigos.rows[0].lote_id;

    // 2. registar a emissão
    const emiss = await c.query(
      `INSERT INTO emissao (parceiro_id, lote_id, valor_factura, factura_ref, n_vouchers, atendente)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [input.parceiroId, loteId, valor, input.facturaRef || null, nVouchers, input.atendente || null]
    );
    const emissaoId = Number(emiss.rows[0].id);

    // 3. marcar os códigos como emitidos
    const ids = codigos.rows.map((r) => r.id);
    await c.query(
      `UPDATE codigo SET emissao_id = $1, emitido_em = now() WHERE id = ANY($2::uuid[])`,
      [emissaoId, ids]
    );

    // 4. quanto resta no lote (para mostrar ao atendente)
    const restante = await c.query(
      `SELECT count(*)::int AS n FROM codigo co JOIN lote l ON l.id = co.lote_id
        WHERE co.parceiro_id = $1 AND co.estado = 'por_activar'
          AND co.emissao_id IS NULL AND l.estado = 'aprovado'`,
      [input.parceiroId]
    );

    return {
      emissao_id: emissaoId,
      n_vouchers: nVouchers,
      valor,
      codigos: codigos.rows.map((r) => r.codigo),
      restante_lote: restante.rows[0].n,
    };
  });
}

/** Quantos vouchers um valor dá — para a calculadora, sem emitir nada. */
export function calcularVouchers(valorFactura) {
  const valor = Math.floor(Number(valorFactura));
  if (!Number.isFinite(valor) || valor < CONFIG.VALOR_MINIMO_MZN) return 0;
  return entradasParaValor(valor);
}
