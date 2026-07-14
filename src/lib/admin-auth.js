// Autenticação do painel de administração. Mesma mecânica do parceiro
// (scrypt + sessão por cookie), mas em tabelas próprias.

import crypto from 'crypto';
import { query } from './db.js';
import { hashSenha, verificarSenha } from './auth.js';

const DIAS_SESSAO = 7; // sessão de admin mais curta que a de parceiro

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function autenticarAdmin(email, senha) {
  const r = await query('SELECT id, nome, senha_hash FROM admin WHERE email = $1', [
    String(email).trim().toLowerCase(),
  ]);
  if (r.rowCount === 0) return null;
  if (!verificarSenha(senha, r.rows[0].senha_hash)) return null;
  return { id: r.rows[0].id, nome: r.rows[0].nome };
}

export async function criarSessaoAdmin(adminId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expira = new Date(Date.now() + DIAS_SESSAO * 864e5);
  await query('INSERT INTO sessao_admin (admin_id, token_hash, expira_em) VALUES ($1, $2, $3)', [
    adminId,
    hashToken(token),
    expira,
  ]);
  return { token, expira };
}

export async function adminDaSessao(token) {
  if (!token) return null;
  const r = await query(
    `SELECT a.id, a.nome, a.email FROM sessao_admin s JOIN admin a ON a.id = s.admin_id
      WHERE s.token_hash = $1 AND s.expira_em > now()`,
    [hashToken(token)]
  );
  return r.rowCount > 0 ? r.rows[0] : null;
}

export async function apagarSessaoAdmin(token) {
  if (!token) return;
  await query('DELETE FROM sessao_admin WHERE token_hash = $1', [hashToken(token)]);
}

// Re-exporta para o script de criação de admin.
export { hashSenha };
