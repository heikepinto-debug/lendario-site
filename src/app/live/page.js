import LiveCliente from './live-cliente';

export const metadata = {
  title: 'Ao vivo · Cansado → Lendário',
};

export const dynamic = 'force-dynamic';

export default function Live() {
  return <LiveCliente />;
}
