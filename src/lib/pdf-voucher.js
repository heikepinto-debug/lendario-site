// Gera o PDF dos vouchers de uma emissão.
//
// Usa pdf-lib (PDF sem browser) + qrcode (QR sem dependências nativas). Ambas
// puro JavaScript, funcionam no serverless da Vercel — ao contrário de
// Puppeteer/Playwright, que excedem o limite de tamanho da função.
//
// Cada voucher: QR (abre /r/{codigo}), link escrito, código, data e o projecto.
// Vários vouchers por página A4, para o atendente imprimir ou enviar.

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

// cor da marca
const OLIVE = rgb(0x67 / 255, 0x82 / 255, 0x15 / 255);
const INK = rgb(0x14 / 255, 0x14 / 255, 0x0f / 255);
const GREY = rgb(0x6b / 255, 0x6b / 255, 0x63 / 255);
const AMBER = rgb(0xa8 / 255, 0x7f / 255, 0x3e / 255);

/**
 * @param {object} opts
 * @param {string[]} opts.codigos      códigos a imprimir
 * @param {string} opts.baseUrl        ex.: https://lendario.fuelinjectiontech.com
 * @param {string} [opts.parceiroNome]
 * @returns {Promise<Uint8Array>} bytes do PDF
 */
export async function gerarPdfVouchers({ codigos, baseUrl, parceiroNome }) {
  const doc = await PDFDocument.create();
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const font = await doc.embedFont(StandardFonts.Helvetica);

  // A4 em pontos
  const A4 = [595.28, 841.89];
  const margem = 40;
  const cardW = A4[0] - margem * 2;
  const cardH = 150;
  const gap = 16;

  let page = doc.addPage(A4);
  let y = A4[1] - margem;

  for (let i = 0; i < codigos.length; i++) {
    // nova página quando não cabe
    if (y - cardH < margem) {
      page = doc.addPage(A4);
      y = A4[1] - margem;
    }

    const codigo = codigos[i];
    const link = `${baseUrl}/r/${codigo}`;

    // QR
    const qrDataUrl = await QRCode.toDataURL(link, { margin: 0, width: 240 });
    const qrPng = await doc.embedPng(qrDataUrl);

    const top = y;
    const left = margem;

    // moldura
    page.drawRectangle({
      x: left, y: top - cardH, width: cardW, height: cardH,
      borderColor: rgb(0.89, 0.89, 0.855), borderWidth: 1,
    });
    // faixa lateral verde
    page.drawRectangle({ x: left, y: top - cardH, width: 5, height: cardH, color: OLIVE });

    // QR à direita
    const qrSize = 110;
    page.drawImage(qrPng, {
      x: left + cardW - qrSize - 20,
      y: top - cardH + (cardH - qrSize) / 2,
      width: qrSize, height: qrSize,
    });

    const tx = left + 24;
    // projecto
    page.drawText('CANSADO -> LENDÁRIO', { x: tx, y: top - 30, size: 16, font: fontBold, color: INK });
    page.drawText('Sorteio de um Mazda 3 · Novembro 2026 · Autódromo de Maputo', {
      x: tx, y: top - 46, size: 8, font, color: GREY,
    });

    // código
    page.drawText('O TEU CÓDIGO', { x: tx, y: top - 74, size: 8, font: fontBold, color: AMBER });
    page.drawText(codigo, { x: tx, y: top - 94, size: 20, font: fontBold, color: INK });

    // instrução + link
    page.drawText('Lê o QR ou entra em:', { x: tx, y: top - 116, size: 9, font, color: GREY });
    page.drawText(link, { x: tx, y: top - 130, size: 9, font: fontBold, color: OLIVE });

    y = top - cardH - gap;
  }

  // rodapé de instruções na última posição livre
  return doc.save();
}
