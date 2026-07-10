import { redirect } from 'next/navigation';
import { parceiroActual } from '@/lib/sessao';
import PainelCliente from './painel-cliente';

export const dynamic = 'force-dynamic';

export default async function PainelParceiro() {
  const p = await parceiroActual();
  if (!p) redirect('/parceiro');
  return <PainelCliente inicial={{ nome: p.nome, estado: p.estado, logo_url: p.logo_url, categoria: p.categoria, localizacao: p.localizacao }} />;
}
