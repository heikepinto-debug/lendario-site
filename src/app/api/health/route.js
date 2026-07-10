export async function GET() {
  return Response.json({ ok: true, servico: 'lendario', ts: new Date().toISOString() });
}
