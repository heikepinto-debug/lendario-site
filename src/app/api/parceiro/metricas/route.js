import { parceiroActual } from '@/lib/sessao';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const p = await parceiroActual();
  if (!p) return Response.json({ ok: false, erro: 'nao_autenticado' }, { status: 401 });

  // números só deste parceiro. Nunca dados de participantes.
  const [emitidos, activados, entradas] = await Promise.all([
    query('SELECT count(*)::int AS n FROM codigo WHERE parceiro_id = $1', [p.id]),
    query("SELECT count(*)::int AS n FROM codigo WHERE parceiro_id = $1 AND estado = 'activado'", [p.id]),
    query('SELECT count(*)::int AS n FROM entrada WHERE parceiro_id = $1', [p.id]),
  ]);

  return Response.json({
    ok: true,
    parceiro: { nome: p.nome, estado: p.estado, logo_url: p.logo_url, categoria: p.categoria, localizacao: p.localizacao },
    metricas: {
      vouchers_emitidos: emitidos.rows[0].n,
      vouchers_activados: activados.rows[0].n,
      entradas_geradas: entradas.rows[0].n,
    },
  });
}
