import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [ent, part, parc] = await Promise.all([
      query('SELECT count(*)::int AS n FROM entrada'),
      query('SELECT count(*)::int AS n FROM participante'),
      query("SELECT count(*)::int AS n FROM parceiro WHERE estado='activo'"),
    ]);
    return Response.json(
      { entradas: ent.rows[0].n, participantes: part.rows[0].n, parceiros: parc.rows[0].n },
      { headers: { 'Cache-Control': 's-maxage=5, stale-while-revalidate=10' } }
    );
  } catch (err) {
    console.error('contador falhou:', err);
    return Response.json({ ok: false, erro: 'erro_interno' }, { status: 500 });
  }
}
