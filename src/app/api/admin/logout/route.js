import { apagarSessaoAdmin } from '@/lib/admin-auth';
import { cookies } from 'next/headers';

export async function POST() {
  const jar = await cookies();
  await apagarSessaoAdmin(jar.get('admin_sessao')?.value);
  const res = Response.json({ ok: true });
  res.headers.set('Set-Cookie', 'admin_sessao=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
  return res;
}
