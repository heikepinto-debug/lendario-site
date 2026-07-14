import { adminActual } from '@/lib/admin-sessao';
import { query, transaction } from '@/lib/db';
import { generate } from '@/lib/codigo';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// GET: lista os parceiros com o estado dos seus lotes/vouchers
export async function GET() {
  const a = await adminActual();
  if (!a) return Response.json({ ok: false, erro: 'nao_autenticado' }, { status: 401 });

  const r = await query(`
    SELECT p.id, p.nome, p.prefixo, p.estado,
      (SELECT count(*)::int FROM codigo c JOIN lote l ON l.id=c.lote_id
        WHERE c.parceiro_id=p.id AND l.estado='aprovado') AS total_aprovado,
      (SELECT count(*)::int FROM codigo c JOIN lote l ON l.id=c.lote_id
        WHERE c.parceiro_id=p.id AND l.estado='aprovado' AND c.emissao_id IS NULL AND c.estado='por_activar') AS por_emitir
    FROM parceiro p
    WHERE p.tipo='ponto_de_venda'
    ORDER BY p.nome
  `);
  return Response.json({ ok: true, parceiros: r.rows });
}

// POST: cria um lote aprovado com N vouchers para um parceiro
export async function POST(request) {
  const a = await adminActual();
  if (!a) return Response.json({ ok: false, erro: 'nao_autenticado' }, { status: 401 });

  const { parceiroId, quantidade } = await request.json();
  const qtd = Math.floor(Number(quantidade));
  if (!parceiroId || !Number.isFinite(qtd) || qtd < 1 || qtd > 500) {
    return Response.json({ ok: false, erro: 'quantidade_invalida' }, { status: 422 });
  }

  try {
    const resultado = await transaction(async (c) => {
      // prefixo do parceiro (para gerar os códigos)
      const p = await c.query('SELECT prefixo FROM parceiro WHERE id = $1', [parceiroId]);
      if (p.rowCount === 0) throw new Error('parceiro_inexistente');
      const prefixo = p.rows[0].prefixo;

      // criar o lote, já aprovado (foi o admin que o criou)
      const lote = await c.query(
        `INSERT INTO lote (parceiro_id, quantidade, estado, automatico, aprovado_por, aprovado_em)
         VALUES ($1, $2, 'aprovado', false, $3, now()) RETURNING id`,
        [parceiroId, qtd, a.id]
      );
      const loteId = lote.rows[0].id;

      // gerar os códigos únicos
      const codigos = [];
      for (let i = 0; i < qtd; i++) {
        let code, ok = false, tentativas = 0;
        while (!ok && tentativas < 5) {
          code = generate(prefixo);
          try {
            await c.query(
              `INSERT INTO codigo (codigo, parceiro_id, lote_id, estado) VALUES ($1, $2, $3, 'por_activar')`,
              [code, parceiroId, loteId]
            );
            ok = true;
          } catch (e) {
            tentativas++; // colisão improvável, tenta outro
          }
        }
        if (ok) codigos.push(code);
      }
      return { loteId, criados: codigos.length };
    });

    return Response.json({ ok: true, ...resultado });
  } catch (err) {
    console.error('criar lote falhou:', err);
    return Response.json({ ok: false, erro: 'erro_interno' }, { status: 500 });
  }
}
