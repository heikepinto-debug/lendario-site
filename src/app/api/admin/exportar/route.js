import { adminActual } from '@/lib/admin-sessao';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/admin/exportar — descarrega todas as entradas em CSV.
// É a salvaguarda offline: com este ficheiro, o sorteio pode correr mesmo sem
// internet no dia. Cada linha é um bilhete elegível.
export async function GET() {
  const a = await adminActual();
  if (!a) return new Response('nao autorizado', { status: 401 });

  const r = await query(`
    SELECT e.id AS bilhete_num, e.hash_verificacao,
           p.nome, p.telefone, p.email,
           pa.nome AS parceiro, e.criado_em
      FROM entrada e
      JOIN participante p ON p.id = e.participante_id
      JOIN parceiro pa ON pa.id = e.parceiro_id
     ORDER BY e.id ASC
  `);

  const linhas = [
    'bilhete,hash,nome,telefone,email,parceiro,data',
    ...r.rows.map((x) => {
      const bilhete = 'E-' + String(x.bilhete_num).padStart(5, '0');
      const esc = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
      return [
        bilhete, x.hash_verificacao, esc(x.nome), esc(x.telefone),
        esc(x.email), esc(x.parceiro), new Date(x.criado_em).toISOString(),
      ].join(',');
    }),
  ];
  const csv = linhas.join('\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="lendario-entradas-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
