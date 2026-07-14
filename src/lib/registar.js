// Registo de um código — o caminho crítico.
// Transforma um voucher em entrada. Concorrência tratada por FOR UPDATE + o
// UNIQUE em entrada.codigo_id (a garantia final, ao nível da base de dados).

import crypto from 'crypto';
import { transaction } from './db.js';
import { validateStructure, canonical } from './codigo.js';
import { normalizePhone } from './telefone.js';
import { CONFIG } from './config.js';

export class RegistoError extends Error {
  constructor(code, httpStatus, extra = {}) {
    super(code);
    this.code = code;
    this.httpStatus = httpStatus;
    this.extra = extra;
  }
}

function hashVerificacao(entradaId) {
  const secret = process.env.HASH_SECRET || 'dev-secret';
  return crypto.createHmac('sha256', secret).update(String(entradaId)).digest('hex').slice(0, 8);
}

export function numeroBilhete(id) {
  return 'E-' + String(id).padStart(5, '0');
}

export async function registarCodigo(input) {
  const agora = input.agora || new Date();

  if (input.consent_sorteio !== true) throw new RegistoError('sem_consentimento', 422);
  if (agora > CONFIG.CUTOFF_REGISTOS) {
    throw new RegistoError('fora_do_periodo', 422, { cutoff: CONFIG.CUTOFF_REGISTOS.toISOString() });
  }

  const nome = String(input.nome || '').trim();
  if (nome.length < 2) throw new RegistoError('nome_invalido', 422);

  const tel = normalizePhone(input.telefone);
  if (!tel.ok) throw new RegistoError('telefone_invalido', 422, { reason: tel.reason });

  const email = String(input.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new RegistoError('email_invalido', 422);

  const estrutura = validateStructure(input.codigo);
  if (!estrutura.ok) throw new RegistoError('codigo_invalido', 404, { reason: estrutura.reason });
  const codigoCanon = canonical(input.codigo);
  const via = ['qr', 'link', 'manual'].includes(input.via) ? input.via : 'manual';
  const optin = input.optin_marketing === true;

  return transaction(async (c) => {
    const cod = await c.query(
      `SELECT co.id, co.estado, co.activado_em, co.parceiro_id, p.estado AS parceiro_estado
         FROM codigo co JOIN parceiro p ON p.id = co.parceiro_id
        WHERE co.codigo = $1 FOR UPDATE`,
      [codigoCanon]
    );
    if (cod.rowCount === 0) throw new RegistoError('codigo_inexistente', 404);
    const row = cod.rows[0];
    if (row.estado !== 'por_activar') {
      throw new RegistoError('codigo_ja_usado', 409, { activado_em: row.activado_em });
    }
    if (row.parceiro_estado !== 'activo') throw new RegistoError('parceiro_inactivo', 409);

    let participante;
    let participanteNovo = false;

    const porTel = await c.query('SELECT id, optin_marketing FROM participante WHERE telefone = $1', [tel.value]);
    if (porTel.rowCount > 0) {
      participante = porTel.rows[0];
      if (optin && !participante.optin_marketing) {
        await c.query('UPDATE participante SET optin_marketing = true, optin_em = now() WHERE id = $1', [participante.id]);
      }
    } else {
      const porEmail = await c.query('SELECT id FROM participante WHERE email = $1', [email]);
      if (porEmail.rowCount > 0) throw new RegistoError('email_em_uso', 409);
      const ins = await c.query(
        `INSERT INTO participante (nome, email, telefone, consent_sorteio, optin_marketing, optin_em)
         VALUES ($1, $2, $3, true, $4, ${optin ? 'now()' : 'NULL'}) RETURNING id`,
        [nome, email, tel.value, optin]
      );
      participante = { id: ins.rows[0].id };
      participanteNovo = true;
    }

    await c.query("UPDATE codigo SET estado = 'activado', activado_em = now() WHERE id = $1", [row.id]);

    // Tecto por pessoa: contar entradas actuais deste participante.
    // (Para um participante novo é 0, por isso nunca bloqueia à primeira.)
    if (!participanteNovo) {
      const cont = await c.query(
        'SELECT count(*)::int AS n FROM entrada WHERE participante_id = $1',
        [participante.id]
      );
      const jaTem = cont.rows[0].n;
      if (jaTem >= CONFIG.TECTO_ENTRADAS_PESSOA) {
        throw new RegistoError('tecto_pessoa', 429, { maximo: CONFIG.TECTO_ENTRADAS_PESSOA });
      }
      // Ao aproximar-se do tecto, sinaliza para o admin rever (não bloqueia).
      if (jaTem + 1 >= CONFIG.ALERTA_ENTRADAS_PESSOA) {
        // só cria se ainda não houver um alerta aberto para esta pessoa
        const jaAlerta = await c.query(
          `SELECT id FROM alerta WHERE tipo='tecto_pessoa' AND entidade='participante'
             AND entidade_id=$1 AND resolvido=false LIMIT 1`,
          [String(participante.id)]
        );
        const det = JSON.stringify({ entradas: jaTem + 1, tecto: CONFIG.TECTO_ENTRADAS_PESSOA });
        if (jaAlerta.rowCount === 0) {
          await c.query(
            `INSERT INTO alerta (tipo, gravidade, entidade, entidade_id, detalhe)
             VALUES ('tecto_pessoa', 'media', 'participante', $1, $2)`,
            [String(participante.id), det]
          );
        } else {
          await c.query(
            'UPDATE alerta SET detalhe = $2, criado_em = now() WHERE id = $1',
            [jaAlerta.rows[0].id, det]
          );
        }
      }
    }

    const ent = await c.query(
      `INSERT INTO entrada (participante_id, parceiro_id, codigo_id, via, hash_verificacao)
       VALUES ($1, $2, $3, $4, 'pendente') RETURNING id`,
      [participante.id, row.parceiro_id, row.id, via]
    );
    const entradaId = Number(ent.rows[0].id);
    const hash = hashVerificacao(entradaId);
    await c.query('UPDATE entrada SET hash_verificacao = $1 WHERE id = $2', [hash, entradaId]);

    await c.query(
      `INSERT INTO auditoria (actor, accao, entidade, entidade_id, valor_depois)
       VALUES ($1, 'registo_codigo', 'entrada', $2, $3)`,
      ['participante:' + participante.id, String(entradaId),
       JSON.stringify({ codigo: codigoCanon, via, parceiro_id: row.parceiro_id })]
    );

    return { bilhete: numeroBilhete(entradaId), entrada_id: entradaId, hash, participante_novo: participanteNovo };
  });
}
