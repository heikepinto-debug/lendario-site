import { adminActual } from '@/lib/admin-sessao';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Auditoria dos participantes: totais e distribuição por parceiro (loja).
export async function GET() {
  const a = await adminActual();
  if (!a) return Response.json({ ok: false, erro: 'nao_autenticado' }, { status: 401 });

  // Por parceiro: quantas entradas gerou, quantas pessoas distintas.
  const porParceiro = await query(`
    SELECT pa.id, pa.nome,
           count(e.id)::int AS entradas,
           count(DISTINCT e.participante_id)::int AS pessoas
      FROM parceiro pa
      LEFT JOIN entrada e ON e.parceiro_id = pa.id
     WHERE pa.tipo = 'ponto_de_venda'
     GROUP BY pa.id, pa.nome
     ORDER BY entradas DESC
  `);

  // Registos ao longo do tempo (por dia, últimos 30 dias com actividade).
  const porDia = await query(`
    SELECT to_char(date_trunc('day', criado_em), 'YYYY-MM-DD') AS dia,
           count(*)::int AS n
      FROM entrada
     GROUP BY 1 ORDER BY 1 DESC LIMIT 30
  `);

  // Consentimento e opt-in (para saber quantos aceitam marketing).
  const consent = await query(`
    SELECT count(*)::int AS total,
           count(*) FILTER (WHERE optin_marketing)::int AS com_marketing
      FROM participante
  `);

  return Response.json({
    ok: true,
    por_parceiro: porParceiro.rows,
    por_dia: porDia.rows.reverse(),
    consentimento: consent.rows[0],
  });
}
