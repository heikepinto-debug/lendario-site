import { adminActual } from '@/lib/admin-sessao';
import { fecharSorteio, correrSorteio, estadoPublico, SorteioError } from '@/lib/sorteio';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  const a = await adminActual();
  if (!a) return Response.json({ ok: false, erro: 'nao_autenticado' }, { status: 401 });
  return Response.json({ ok: true, sorteio: await estadoPublico() });
}

// POST { accao: 'fechar' | 'sortear' }
export async function POST(request) {
  const a = await adminActual();
  if (!a) return Response.json({ ok: false, erro: 'nao_autenticado' }, { status: 401 });

  try {
    const { accao } = await request.json();
    if (accao === 'fechar') {
      return Response.json({ ok: true, ...(await fecharSorteio()) });
    }
    if (accao === 'sortear') {
      return Response.json({ ok: true, ...(await correrSorteio()) });
    }
    return Response.json({ ok: false, erro: 'accao_invalida' }, { status: 422 });
  } catch (err) {
    if (err instanceof SorteioError) {
      return Response.json({ ok: false, erro: err.code, ...err.extra }, { status: err.httpStatus });
    }
    console.error('sorteio falhou:', err);
    return Response.json({ ok: false, erro: 'erro_interno' }, { status: 500 });
  }
}
