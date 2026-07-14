import { adminActual } from '@/lib/admin-sessao';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const a = await adminActual();
  if (!a) return Response.json({ ok: false, erro: 'nao_autenticado' }, { status: 401 });

  const alertas = await query(`
    SELECT al.id, al.tipo, al.gravidade, al.entidade, al.entidade_id, al.detalhe, al.criado_em,
           CASE WHEN al.entidade='participante'
                THEN (SELECT nome FROM participante WHERE id = al.entidade_id::uuid)
                WHEN al.entidade='parceiro'
                THEN (SELECT nome FROM parceiro WHERE id = al.entidade_id::uuid)
           END AS nome
      FROM alerta al
     WHERE al.resolvido = false
     ORDER BY al.gravidade DESC, al.criado_em DESC
  `);
  return Response.json({ ok: true, alertas: alertas.rows });
}

export async function PUT(request) {
  const a = await adminActual();
  if (!a) return Response.json({ ok: false, erro: 'nao_autenticado' }, { status: 401 });
  const { id } = await request.json();
  await query('UPDATE alerta SET resolvido = true WHERE id = $1', [id]);
  return Response.json({ ok: true });
}
