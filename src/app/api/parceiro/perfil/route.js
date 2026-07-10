import { parceiroActual } from '@/lib/sessao';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 15;

// Limite de tamanho do logo (base64). ~400 KB de imagem.
const MAX_LOGO_BYTES = 550_000;
const TIPOS = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

export async function PUT(request) {
  const p = await parceiroActual();
  if (!p) return Response.json({ ok: false, erro: 'nao_autenticado' }, { status: 401 });

  try {
    const body = await request.json();
    const campos = [];
    const valores = [];
    let i = 1;

    if (typeof body.categoria === 'string' && body.categoria.trim()) {
      campos.push(`categoria = $${i++}`); valores.push(body.categoria.trim());
    }
    if (typeof body.localizacao === 'string' && body.localizacao.trim()) {
      campos.push(`localizacao = $${i++}`); valores.push(body.localizacao.trim());
    }
    if (typeof body.link === 'string') {
      campos.push(`link = $${i++}`); valores.push(body.link.trim());
    }

    // logo: recebido como data URL (data:image/png;base64,....)
    if (typeof body.logo === 'string' && body.logo.startsWith('data:')) {
      const m = body.logo.match(/^data:([^;]+);base64,/);
      if (!m || !TIPOS.includes(m[1])) {
        return Response.json({ ok: false, erro: 'tipo_invalido' }, { status: 422 });
      }
      if (body.logo.length > MAX_LOGO_BYTES) {
        return Response.json({ ok: false, erro: 'logo_grande' }, { status: 422 });
      }
      campos.push(`logo_url = $${i++}`); valores.push(body.logo);
    }

    if (campos.length === 0) {
      return Response.json({ ok: false, erro: 'nada_a_actualizar' }, { status: 422 });
    }

    valores.push(p.id);
    await query(`UPDATE parceiro SET ${campos.join(', ')} WHERE id = $${i}`, valores);

    // se agora tem logo + categoria + localização, pode passar a activo
    const check = await query(
      `SELECT logo_url, categoria, localizacao, estado FROM parceiro WHERE id = $1`,
      [p.id]
    );
    const c = check.rows[0];
    let estado = c.estado;
    if (c.estado === 'incompleto' && c.logo_url && c.categoria && c.localizacao) {
      await query("UPDATE parceiro SET estado = 'activo' WHERE id = $1", [p.id]);
      estado = 'activo';
    }

    return Response.json({ ok: true, estado });
  } catch (err) {
    console.error('perfil falhou:', err);
    return Response.json({ ok: false, erro: 'erro_interno' }, { status: 500 });
  }
}
