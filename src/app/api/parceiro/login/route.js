import { autenticar, criarSessao } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, senha } = await request.json();
    const p = await autenticar(email, senha);
    if (!p) {
      return Response.json({ ok: false, erro: 'credenciais_invalidas' }, { status: 401 });
    }
    const { token, expira } = await criarSessao(p.id);
    const res = Response.json({ ok: true, nome: p.nome, estado: p.estado });
    res.headers.set(
      'Set-Cookie',
      `parceiro_sessao=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expira.toUTCString()}`
    );
    return res;
  } catch (err) {
    console.error('login falhou:', err);
    return Response.json({ ok: false, erro: 'erro_interno' }, { status: 500 });
  }
}
