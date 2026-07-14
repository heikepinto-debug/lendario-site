import { parceiroActual } from '@/lib/sessao';
import { emitirVouchers, calcularVouchers, EmissaoError } from '@/lib/emissao';
import { gerarPdfVouchers } from '@/lib/pdf-voucher';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// GET ?valor=12000 → calculadora: quantos vouchers dá, sem emitir
export async function GET(request) {
  const p = await parceiroActual();
  if (!p) return Response.json({ ok: false, erro: 'nao_autenticado' }, { status: 401 });
  const valor = Number(new URL(request.url).searchParams.get('valor') || 0);
  return Response.json({ ok: true, vouchers: calcularVouchers(valor) });
}

// POST → emite os vouchers e devolve o PDF
export async function POST(request) {
  const p = await parceiroActual();
  if (!p) return Response.json({ ok: false, erro: 'nao_autenticado' }, { status: 401 });

  try {
    const { valorFactura, facturaRef, atendente } = await request.json();
    const r = await emitirVouchers({
      parceiroId: p.id,
      valorFactura,
      facturaRef,
      atendente,
    });

    // gerar o PDF dos vouchers emitidos
    const origin = new URL(request.url).origin;
    const pdf = await gerarPdfVouchers({
      codigos: r.codigos,
      baseUrl: origin,
      parceiroNome: p.nome,
    });

    // devolver o PDF em base64 + metadados (para o portal mostrar e descarregar)
    return Response.json({
      ok: true,
      n_vouchers: r.n_vouchers,
      valor: r.valor,
      restante_lote: r.restante_lote,
      codigos: r.codigos,
      pdf_base64: Buffer.from(pdf).toString('base64'),
    });
  } catch (err) {
    if (err instanceof EmissaoError) {
      return Response.json({ ok: false, erro: err.code, ...err.extra }, { status: err.httpStatus });
    }
    console.error('emissão falhou:', err);
    return Response.json({ ok: false, erro: 'erro_interno' }, { status: 500 });
  }
}
