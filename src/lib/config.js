// Constantes e regras do sorteio. Um único sítio para tudo o que o negócio fixou.

export const CONFIG = {
  VALOR_MINIMO_MZN: 2500,
  ESCALOES: [
    { desde: 2500, ate: 9999, entradas: 1 },
    { desde: 10000, ate: 24999, entradas: 3 },
    { desde: 25000, ate: Infinity, entradas: 5 },
  ],
  TECTO_ENTRADAS_FACTURA: 5,
  LOTE_PRIMEIRO: 100,
  LOTE_PADRAO: 100,
  LOTE_MAX: 500,
  // Africa/Maputo é UTC+2 o ano todo.
  CUTOFF_REGISTOS: new Date('2026-11-07T23:59:59+02:00'),
  DATA_SORTEIO: '2026-11-08',
  YOUTUBE_PLAYLIST_ID: 'PLWk5WB1OBQXA',
};

// Dado um valor de factura, quantas entradas atribui (usado no voucher e no site).
export function entradasParaValor(valorMzn) {
  if (valorMzn < CONFIG.VALOR_MINIMO_MZN) return 0;
  for (const e of CONFIG.ESCALOES) {
    if (valorMzn >= e.desde && valorMzn <= e.ate) return e.entradas;
  }
  return CONFIG.TECTO_ENTRADAS_FACTURA;
}
