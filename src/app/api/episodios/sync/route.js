import { sincronizarEpisodios } from '@/lib/youtube';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// GET /api/episodios/sync — actualiza o cache a partir do YouTube.
// Chamado por um Cron da Vercel (ver vercel.json) e disponível manualmente.
export async function GET() {
  try {
    const n = await sincronizarEpisodios();
    return Response.json({ ok: true, episodios: n });
  } catch (err) {
    return Response.json({ ok: false, erro: String(err.message) }, { status: 502 });
  }
}
