import { adminActual } from '@/lib/admin-sessao';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const a = await adminActual();
  if (!a) return Response.json({ ok: false, erro: 'nao_autenticado' }, { status: 401 });

  // Totais gerais
  const [entradas, participantes, parceirosAct, alertasAbertos] = await Promise.all([
    query('SELECT count(*)::int AS n FROM entrada'),
    query('SELECT count(*)::int AS n FROM participante'),
    query("SELECT count(*)::int AS n FROM parceiro WHERE estado='activo'"),
    query('SELECT count(*)::int AS n FROM alerta WHERE resolvido=false'),
  ]);

  // Parceiros com métricas de fraude: emitidos, activados, taxa de activação.
  // Taxa baixa = muitos vouchers emitidos mas poucos usados por pessoas reais.
  const parceiros = await query(`
    SELECT p.id, p.nome, p.estado,
           (SELECT count(*)::int FROM codigo c WHERE c.parceiro_id = p.id) AS emitidos,
           (SELECT count(*)::int FROM codigo c WHERE c.parceiro_id = p.id AND c.estado='activado') AS activados,
           (SELECT count(*)::int FROM entrada e WHERE e.parceiro_id = p.id) AS entradas
      FROM parceiro p
     ORDER BY entradas DESC
  `);

  // Top participantes por nº de entradas (para veres quem acumula)
  const topPessoas = await query(`
    SELECT p.id, p.nome,
           right(p.telefone, 4) AS tel_fim,
           count(e.id)::int AS entradas
      FROM participante p JOIN entrada e ON e.participante_id = p.id
     GROUP BY p.id, p.nome, p.telefone
     ORDER BY entradas DESC
     LIMIT 10
  `);

  return Response.json({
    ok: true,
    admin: { nome: a.nome },
    totais: {
      entradas: entradas.rows[0].n,
      participantes: participantes.rows[0].n,
      parceiros_activos: parceirosAct.rows[0].n,
      alertas_abertos: alertasAbertos.rows[0].n,
    },
    parceiros: parceiros.rows.map((p) => ({
      ...p,
      taxa_activacao: p.emitidos > 0 ? Math.round((p.activados / p.emitidos) * 100) : null,
    })),
    top_pessoas: topPessoas.rows,
  });
}
