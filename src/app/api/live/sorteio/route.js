import { estadoPublico } from '@/lib/sorteio';

export const dynamic = 'force-dynamic';

// Estado público do sorteio: o compromisso antes, o resultado depois.
// É esta rota que a página /live consulta, e onde qualquer pessoa pode ir
// buscar os dados para verificar o sorteio por si.
export async function GET() {
  try {
    return Response.json(await estadoPublico(), {
      headers: { 'Cache-Control': 's-maxage=2, stale-while-revalidate=5' },
    });
  } catch (err) {
    console.error('estado do sorteio falhou:', err);
    return Response.json({ erro: 'erro_interno' }, { status: 500 });
  }
}
