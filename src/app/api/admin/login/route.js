import { autenticarAdmin, criarSessaoAdmin } from '@/lib/admin-auth';

export async function POST(request) {
  try {
    const { email, senha } = await request.json();
    const a = await autenticarAdmin(email, senha);
    if (!a) return Response.json({ ok: false, erro: 'credenciais_invalidas' }, { status: 401 });
    const { token, expira } = await criarSessaoAdmin(a.id);
    const res = Response.json({ ok: true, nome: a.nome });
    res.headers.set(
      'Set-Cookie',
      `admin_sessao=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expira.toUTCString()}`
    );
    return res;
  } catch (err) {
    console.error('login admin falhou:', err);
    return Response.json({ ok: false, erro: 'erro_interno' }, { status: 500 });
  }
}
