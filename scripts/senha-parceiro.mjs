// Gera o SQL para definir a senha de um parceiro.
// Uso:  node scripts/senha-parceiro.mjs FI "senha-escolhida"
// Depois cola o SQL que ele imprime no SQL Editor da Neon.

import crypto from 'crypto';

function hashSenha(senha) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(senha, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

const prefixo = process.argv[2];
const senha = process.argv[3];

if (!prefixo || !senha) {
  console.log('\n  Uso: node scripts/senha-parceiro.mjs PREFIXO "senha"\n');
  console.log('  Exemplo: node scripts/senha-parceiro.mjs FI "FuelInj2026!"\n');
  process.exit(1);
}

const hash = hashSenha(senha);

console.log('\n  Cola isto no SQL Editor da Neon:\n');
console.log(`  UPDATE parceiro SET senha_hash = '${hash}' WHERE prefixo = '${prefixo.toUpperCase()}';\n`);
console.log(`  (O parceiro ${prefixo.toUpperCase()} entra com o email dele e a senha "${senha}".)\n`);
