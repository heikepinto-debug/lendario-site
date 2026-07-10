import { registarCodigo, RegistoError } from '@/lib/registar';

export async function POST(request) {
  try {
    const body = await request.json();
    const via = ['qr', 'link', 'manual'].includes(body.via) ? body.via : 'manual';
    const r = await registarCodigo({ ...body, via });
    return Response.json(
      { ok: true, bilhete: r.bilhete, participante_novo: r.participante_novo },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof RegistoError) {
      return Response.json({ ok: false, erro: err.code, ...err.extra }, { status: err.httpStatus });
    }
    console.error('registo falhou:', err);
    return Response.json({ ok: false, erro: 'erro_interno' }, { status: 500 });
  }
}
