// Motor do sorteio.
//
// O problema: como é que alguém acredita que o sorteio não foi combinado?
// A resposta é compromisso prévio (commit-reveal):
//
//   1. FECHAR — no cutoff, a lista de bilhetes é congelada e calcula-se a sua
//      impressão digital (lista_hash). Gera-se uma semente secreta e publica-se
//      apenas o seu hash (semente_hash). Ambos ficam públicos ANTES da extracção.
//      A partir daqui: não se pode acrescentar/remover bilhetes (mudaria o
//      lista_hash) nem trocar a semente (mudaria o semente_hash).
//
//   2. SORTEAR — revela-se a semente. O vencedor sai de uma conta determinística
//      sobre (semente + lista_hash). Não há escolha humana no meio.
//
//   3. VERIFICAR — qualquer pessoa, com a lista pública e a semente revelada,
//      refaz a conta e chega ao mesmo vencedor. Se o Organizador tivesse batoteado,
//      as contas não fechavam.
//
// A extracção é sequencial e sem reposição: vencedor, depois 1.º suplente, etc.

import crypto from 'crypto';
import { query, transaction } from './db.js';
import { numeroBilhete } from './registar.js';

export const N_SUPLENTES = 3; // cláusula 6 dos T&C

export class SorteioError extends Error {
  constructor(code, httpStatus = 400, extra = {}) {
    super(code);
    this.code = code;
    this.httpStatus = httpStatus;
    this.extra = extra;
  }
}

/** Impressão digital da lista de bilhetes. Qualquer alteração muda o hash. */
export function calcularListaHash(linhas) {
  const h = crypto.createHash('sha256');
  for (const l of linhas) h.update(l + '\n');
  return h.digest('hex');
}

/** Uma linha por bilhete, na ordem de emissão. É isto que é assinado. */
function linhaDe(entrada) {
  return `${numeroBilhete(entrada.id)}|${entrada.hash_verificacao}`;
}

/**
 * A conta do sorteio. Determinística: mesma semente + mesma lista = mesmo resultado.
 * Sequencial sem reposição — cada posição sai do que resta.
 *
 * @param {string} semente
 * @param {string} listaHash
 * @param {number} total     quantos bilhetes há
 * @param {number} quantos   quantas posições extrair (vencedor + suplentes)
 * @returns {number[]} índices escolhidos, pela ordem de extracção
 */
export function extrair(semente, listaHash, total, quantos) {
  if (total < 1) throw new SorteioError('sem_entradas', 422);
  const n = Math.min(quantos, total);

  // pool dos índices ainda por sair
  const pool = Array.from({ length: total }, (_, i) => i);
  const escolhidos = [];

  for (let posicao = 0; posicao < n; posicao++) {
    // valor determinístico para esta posição
    const h = crypto
      .createHmac('sha256', semente)
      .update(`${listaHash}:${posicao}`)
      .digest('hex');
    // hash -> índice dentro do que resta
    const idx = Number(BigInt('0x' + h) % BigInt(pool.length));
    escolhidos.push(pool[idx]);
    pool.splice(idx, 1); // sem reposição
  }
  return escolhidos;
}

/** Lê a lista de bilhetes, sempre pela mesma ordem (id crescente). */
async function lerLista(c) {
  const r = await (c ? c.query.bind(c) : query)(
    `SELECT e.id, e.hash_verificacao, e.participante_id
       FROM entrada e ORDER BY e.id ASC`
  );
  return r.rows;
}

/**
 * FECHAR: congela a lista e publica o compromisso.
 * A partir daqui não entram mais bilhetes neste sorteio.
 */
export async function fecharSorteio(nome = 'Cansado → Lendário') {
  return transaction(async (c) => {
    const aberto = await c.query(
      "SELECT id, estado FROM sorteio WHERE estado <> 'sorteado' ORDER BY criado_em DESC LIMIT 1"
    );
    if (aberto.rowCount > 0 && aberto.rows[0].estado === 'fechado') {
      throw new SorteioError('ja_fechado', 409);
    }

    const linhas = (await lerLista(c)).map(linhaDe);
    if (linhas.length === 0) throw new SorteioError('sem_entradas', 422);

    const listaHash = calcularListaHash(linhas);
    const semente = crypto.randomBytes(32).toString('hex');
    const sementeHash = crypto.createHash('sha256').update(semente).digest('hex');

    let id;
    if (aberto.rowCount > 0) {
      id = aberto.rows[0].id;
      await c.query(
        `UPDATE sorteio SET estado='fechado', total_entradas=$2, lista_hash=$3,
                semente=$4, semente_hash=$5, fechado_em=now() WHERE id=$1`,
        [id, linhas.length, listaHash, semente, sementeHash]
      );
    } else {
      const ins = await c.query(
        `INSERT INTO sorteio (nome, estado, total_entradas, lista_hash, semente, semente_hash, fechado_em)
         VALUES ($1, 'fechado', $2, $3, $4, $5, now()) RETURNING id`,
        [nome, linhas.length, listaHash, semente, sementeHash]
      );
      id = ins.rows[0].id;
    }

    return {
      id,
      total_entradas: linhas.length,
      lista_hash: listaHash,
      semente_hash: sementeHash, // isto é público; a semente ainda não
    };
  });
}

/**
 * SORTEAR: revela a semente e extrai vencedor + suplentes.
 * Verifica primeiro que a lista não mudou desde o fecho.
 */
export async function correrSorteio() {
  return transaction(async (c) => {
    const s = await c.query(
      "SELECT * FROM sorteio WHERE estado='fechado' ORDER BY fechado_em DESC LIMIT 1"
    );
    if (s.rowCount === 0) throw new SorteioError('nao_fechado', 409);
    const sorteio = s.rows[0];

    // integridade: a lista tem de ser exactamente a que foi congelada
    const entradas = await lerLista(c);
    const listaHash = calcularListaHash(entradas.map(linhaDe));
    if (listaHash !== sorteio.lista_hash) {
      throw new SorteioError('lista_alterada', 409, {
        esperado: sorteio.lista_hash,
        actual: listaHash,
      });
    }

    const indices = extrair(sorteio.semente, sorteio.lista_hash, entradas.length, 1 + N_SUPLENTES);

    const resultados = [];
    for (let pos = 0; pos < indices.length; pos++) {
      const e = entradas[indices[pos]];
      const bilhete = numeroBilhete(e.id);
      await c.query(
        `INSERT INTO sorteio_resultado (sorteio_id, posicao, entrada_id, bilhete, participante_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [sorteio.id, pos, e.id, bilhete, e.participante_id]
      );
      resultados.push({ posicao: pos, bilhete, entrada_id: e.id });
    }

    await c.query("UPDATE sorteio SET estado='sorteado', sorteado_em=now() WHERE id=$1", [sorteio.id]);

    return { sorteio_id: sorteio.id, total_entradas: entradas.length, resultados };
  });
}

/** Estado público do sorteio — para a página /live e para quem quiser verificar. */
export async function estadoPublico() {
  const s = await query('SELECT * FROM sorteio ORDER BY criado_em DESC LIMIT 1');
  if (s.rowCount === 0) return { estado: 'aberto' };
  const x = s.rows[0];

  const base = {
    estado: x.estado,
    total_entradas: x.total_entradas,
    lista_hash: x.lista_hash,
    semente_hash: x.semente_hash,
    fechado_em: x.fechado_em,
    sorteado_em: x.sorteado_em,
  };
  // a semente só é revelada depois da extracção
  if (x.estado !== 'sorteado') return base;

  const r = await query(
    `SELECT sr.posicao, sr.bilhete, p.nome
       FROM sorteio_resultado sr JOIN participante p ON p.id = sr.participante_id
      WHERE sr.sorteio_id = $1 ORDER BY sr.posicao`,
    [x.id]
  );
  return {
    ...base,
    semente: x.semente, // revelada — permite a qualquer um refazer a conta
    resultados: r.rows.map((row) => ({
      posicao: row.posicao,
      bilhete: row.bilhete,
      nome: primeiroENome(row.nome),
    })),
  };
}

/** Mostra "João S." em vez do nome completo, nos ecrãs públicos. */
function primeiroENome(nome) {
  const partes = String(nome || '').trim().split(/\s+/);
  if (partes.length === 1) return partes[0];
  return `${partes[0]} ${partes[partes.length - 1][0]}.`;
}
