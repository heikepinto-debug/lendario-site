/**
 * Códigos de voucher — Cansado → Lendário
 *
 * Formato:  FIT-{PREFIXO}-{6 chars}{checksum}
 * Exemplo:  FIT-FI-A7K2M9X
 *
 * Decisões de desenho:
 *  - Alfabeto sem caracteres ambíguos (0/O, 1/I/L): quem lê um voucher no balcão
 *    e o escreve à mão não se engana entre zero e ó.
 *  - Aleatoriedade criptográfica (crypto.randomInt), nunca Math.random: um código
 *    previsível é um código forjável.
 *  - Um dígito de checksum: 30 em cada 31 tentativas de adivinhar um código são
 *    rejeitadas antes de tocar na base de dados. É rate-limiting grátis.
 */

import crypto from 'crypto';

// 31 caracteres. Sem 0 O 1 I L.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const BASE = ALPHABET.length; // 31
const RANDOM_LEN = 6;
const PREFIX_RE = /^[A-Z]{2,4}$/;

// índice inverso para validação O(1)
const INDEX = Object.fromEntries([...ALPHABET].map((c, i) => [c, i]));

/**
 * Checksum: soma ponderada dos índices (corpo aleatório + prefixo), módulo 31.
 * Incluir o prefixo no cálculo significa que um código válido para "FI" não é
 * válido para "TS" — não se pode reaproveitar o corpo entre parceiros.
 */
function checksumChar(prefix, body) {
  const material = prefix + body;
  let sum = 0;
  for (let i = 0; i < material.length; i++) {
    // charCodeAt em vez do índice do alfabeto restrito: o prefixo pode conter
    // letras fora do alfabeto do corpo (I, L, O), e essas dariam índice undefined
    // -> NaN -> checksum 'undefined'. O código do caractere está sempre definido.
    // O peso posicional (i+2) garante que trocar dois caracteres de sítio muda o resultado.
    sum += material.charCodeAt(i) * (i + 2);
  }
  return ALPHABET[sum % BASE];
}

/** Gera o corpo aleatório de 6 caracteres com fonte criptográfica. */
function randomBody() {
  let body = '';
  for (let i = 0; i < RANDOM_LEN; i++) {
    body += ALPHABET[crypto.randomInt(BASE)];
  }
  return body;
}

/**
 * Gera um código completo para um dado prefixo de parceiro.
 * @param {string} prefix  2–4 letras maiúsculas (ex.: "FI")
 * @returns {string}       ex.: "FIT-FI-A7K2M9X"
 */
function generate(prefix) {
  if (!PREFIX_RE.test(prefix)) {
    throw new Error(`prefixo inválido: ${JSON.stringify(prefix)} (esperado 2–4 letras A–Z)`);
  }
  const body = randomBody();
  const check = checksumChar(prefix, body);
  return `FIT-${prefix}-${body}${check}`;
}

/**
 * Gera um lote de códigos únicos entre si.
 * Colisões dentro de um lote são astronomicamente improváveis (31^6 espaço),
 * mas verificamos à mesma — a unicidade real é garantida pela BD no INSERT;
 * aqui evitamos gerar dois iguais no mesmo pedido.
 * @param {string} prefix
 * @param {number} quantidade
 * @returns {string[]}
 */
function generateBatch(prefix, quantidade) {
  if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 500) {
    throw new Error(`quantidade inválida: ${quantidade} (esperado inteiro 1–500)`);
  }
  const set = new Set();
  while (set.size < quantidade) {
    set.add(generate(prefix));
  }
  return [...set];
}

/**
 * Valida a estrutura e o checksum de um código, sem tocar na base de dados.
 * Barato e determinístico: corre antes de qualquer query no fluxo de registo.
 *
 * NÃO diz se o código existe ou se já foi usado — isso é trabalho da BD.
 * Diz apenas: "isto tem a forma de um código nosso e o checksum bate certo".
 *
 * @param {string} code
 * @returns {{ok: true, prefix: string, body: string} | {ok: false, reason: string}}
 */
function validateStructure(code) {
  if (typeof code !== 'string') {
    return { ok: false, reason: 'nao_e_texto' };
  }
  const clean = code.trim().toUpperCase();
  const parts = clean.split('-');
  if (parts.length !== 3 || parts[0] !== 'FIT') {
    return { ok: false, reason: 'formato' };
  }
  const [, prefix, tail] = parts;
  if (!PREFIX_RE.test(prefix)) {
    return { ok: false, reason: 'prefixo' };
  }
  if (tail.length !== RANDOM_LEN + 1) {
    return { ok: false, reason: 'comprimento' };
  }
  const body = tail.slice(0, RANDOM_LEN);
  const check = tail.slice(RANDOM_LEN);
  for (const ch of body + check) {
    if (!(ch in INDEX)) {
      return { ok: false, reason: 'caractere_invalido' };
    }
  }
  if (checksumChar(prefix, body) !== check) {
    return { ok: false, reason: 'checksum' };
  }
  return { ok: true, prefix, body };
}

/** Normaliza para a forma canónica (maiúsculas, sem espaços). */
function canonical(code) {
  return String(code).trim().toUpperCase();
}

export {
  ALPHABET,
  generate,
  generateBatch,
  validateStructure,
  checksumChar,
  canonical,
};
