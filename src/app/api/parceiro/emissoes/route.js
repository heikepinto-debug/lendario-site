import { parceiroActual } from '@/lib/sessao';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Histórico de emissões deste parceiro — para o dono auditar os atendentes.
export async function GET() {
  const p = await parceiroActual();
  if (!p) return Response.json({ ok: false, erro: 'nao_autenticado' }, { status: 401 });

  const r = await query(
    `SELECT id, valor_factura, factura_ref, n_vouchers, atendente, criado_em
       FROM emissao WHERE parceiro_id = $1
      ORDER BY criado_em DESC LIMIT 100`,
    [p.id]
  );

  const totais = await query(
    `SELECT count(*)::int AS emissoes, coalesce(sum(n_vouchers),0)::int AS vouchers,
            coalesce(sum(valor_factura),0)::bigint AS valor_total
       FROM emissao WHERE parceiro_id = $1`,
    [p.id]
  );

  return Response.json({
    ok: true,
    emissoes: r.rows,
    totais: totais.rows[0],
  });
}
