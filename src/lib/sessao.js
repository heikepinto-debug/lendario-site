import { cookies } from 'next/headers';
import { parceiroDaSessao } from './auth.js';

// Lê o cookie e devolve o parceiro autenticado, ou null.
export async function parceiroActual() {
  const jar = await cookies();
  const token = jar.get('parceiro_sessao')?.value;
  return parceiroDaSessao(token);
}
