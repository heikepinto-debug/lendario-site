import { redirect } from 'next/navigation';
import { adminActual } from '@/lib/admin-sessao';
import PainelAdmin from './painel-cliente';

export const dynamic = 'force-dynamic';

export default async function AdminPainel() {
  const a = await adminActual();
  if (!a) redirect('/admin');
  return <PainelAdmin />;
}
