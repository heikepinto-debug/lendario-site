import { apagarSessao } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST() {
  const jar = await cookies();
  const token = jar.get('parceiro_sessao')?.value;
  await apagarSessao(token);
  const res = Response.json({ ok: true });
  res.headers.set('Set-Cookie', 'parceiro_sessao=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
  return res;
}
