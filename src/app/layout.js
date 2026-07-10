import './globals.css';
export const metadata = {
  title: 'Cansado → Lendário | Fuel Injection',
  description: 'Um Mazda 3 reconstruído do zero e sorteado ao vivo a 8 de Novembro, no Autódromo Internacional de Maputo. Compra num parceiro, regista o código, e o carro pode ser teu.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
