/** @type {import('next').NextConfig} */
const nextConfig = {
  // O driver da Neon usa 'ws' no servidor; garante que não é empacotado no cliente.
  serverExternalPackages: ['@neondatabase/serverless', 'ws'],
  async redirects() {
    return [
      // /r/{codigo} → formulário de registo com o código pré-preenchido
      { source: '/r/:codigo', destination: '/registar?c=:codigo', permanent: false },
    ];
  },
};

export default nextConfig;
