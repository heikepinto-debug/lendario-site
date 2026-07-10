// Autenticação do portal do parceiro: senha (scrypt) + sessão por cookie.
// scrypt é nativo do Node — sem dependências, e resistente a força bruta.

import crypto from 'crypto';
import { query } from './db.js';

// ---------- senha ----------

export function hashSenha(senha) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(senha, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

export function verificarSenha(senha, hash) {
  if (!hash || !hash.startsWith('scrypt$')) return false;
  const [, salt, derived] = hash.split('$');
  const test = crypto.scryptSync(senha, salt, 64).toString('hex');
  // comparação em tempo constante
  const a = Buffer.from(derived, 'hex');
  const b = Buffer.from(test, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ---------- sessão ----------

const DIAS_SESSAO = 30;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Cria uma sessão e devolve o token em claro (vai para o cookie; só o hash fica na BD).
export async function criarSessao(parceiroId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expira = new Date(Date.now() + DIAS_SESSAO * 864e5);
  await query(
    'INSERT INTO sessao_parceiro (parceiro_id, token_hash, expira_em) VALUES ($1, $2, $3)',
    [parceiroId, hashToken(token), expira]
  );
  return { token, expira };
}

// Devolve o parceiro da sessão, ou null se inválida/expirada.
export async function parceiroDaSessao(token) {
  if (!token) return null;
  const r = await query(
    `SELECT p.id, p.nome, p.prefixo, p.categoria, p.localizacao, p.logo_url, p.estado, p.contacto_email
       FROM sessao_parceiro s JOIN parceiro p ON p.id = s.parceiro_id
      WHERE s.token_hash = $1 AND s.expira_em > now()`,
    [hashToken(token)]
  );
  return r.rowCount > 0 ? r.rows[0] : null;
}

export async function apagarSessao(token) {
  if (!token) return;
  await query('DELETE FROM sessao_parceiro WHERE token_hash = $1', [hashToken(token)]);
}

// Autentica por email + senha; devolve o parceiro ou null.
export async function autenticar(email, senha) {
  const r = await query(
    'SELECT id, nome, senha_hash, estado FROM parceiro WHERE contacto_email = $1',
    [String(email).trim().toLowerCase()]
  );
  if (r.rowCount === 0) return null;
  const p = r.rows[0];
  if (!verificarSenha(senha, p.senha_hash)) return null;
  return { id: p.id, nome: p.nome, estado: p.estado };
}
