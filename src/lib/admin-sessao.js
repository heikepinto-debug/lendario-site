import { cookies } from 'next/headers';
import { adminDaSessao } from './admin-auth.js';

export async function adminActual() {
  const jar = await cookies();
  const token = jar.get('admin_sessao')?.value;
  return adminDaSessao(token);
}
