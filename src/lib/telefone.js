/**
 * Normalização de telefones moçambicanos para +258XXXXXXXXX.
 *
 * Porque isto importa: o telefone é a chave de identidade e de deduplicação.
 * A mesma pessoa escreve o número de cinco maneiras diferentes ao longo da
 * campanha — com espaços, com zero à frente, com +258, sem nada. Se não os
 * reduzirmos todos à mesma forma, a mesma pessoa conta como cinco participantes
 * e o contacto do vencedor fica em risco.
 *
 * Moçambique: código +258, telemóveis com 9 dígitos começados por 8,
 * segundo dígito 2–7 (82/83 Vodacom, 84/85 mCel/Movitel, 86/87 Movitel).
 */

// aceita 84XXXXXXX (9 díg), 084XXXXXXX (0 + 9), 25884XXXXXXX, +25884XXXXXXX
const MOVEL_RE = /^8[2-7][0-9]{7}$/;

/**
 * @param {string} input
 * @returns {{ok: true, value: string} | {ok: false, reason: string}}
 */
function normalizePhone(input) {
  if (typeof input !== 'string') {
    return { ok: false, reason: 'nao_e_texto' };
  }

  // remover tudo o que não seja dígito ou +
  let s = input.trim().replace(/[^\d+]/g, '');

  // formas com prefixo internacional
  if (s.startsWith('+258')) s = s.slice(4);
  else if (s.startsWith('258')) s = s.slice(3);
  // zero nacional à frente (084...) — não existe trunk "0" em Moçambique,
  // mas as pessoas escrevem-no por hábito
  else if (s.startsWith('0')) s = s.slice(1);

  // qualquer + restante é inválido a esta altura
  if (s.includes('+')) {
    return { ok: false, reason: 'formato' };
  }

  if (!MOVEL_RE.test(s)) {
    return { ok: false, reason: 'nao_e_movel_mz' };
  }

  return { ok: true, value: '+258' + s };
}

export { normalizePhone };
