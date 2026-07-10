// Setup da base de dados: cria as tabelas e mete os parceiros iniciais.
// Corre uma vez, depois do deploy: `npm run db:setup`
//
// Idempotente: se as tabelas já existem, não rebenta — verifica e continua.

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { generate } from '../src/lib/codigo.js';

if (!neonConfig.webSocketConstructor) neonConfig.webSocketConstructor = ws;

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('\n  ✗ DATABASE_URL não definido.\n    Cria a base de dados na Neon e cola a connection string.\n');
    process.exit(1);
  }
  // Para o setup usa-se a ligação directa (sem -pooler) se possível.
  const pool = new Pool({ connectionString: url });

  try {
    // 1. já está montado?
    const existe = await pool.query(
      "SELECT 1 FROM information_schema.tables WHERE table_name = 'parceiro' LIMIT 1"
    ).catch(() => ({ rowCount: 0 }));

    if (existe.rowCount > 0) {
      console.log('\n  ✓ Tabelas já existem. Nada a fazer.\n');
      await pool.end();
      return;
    }

    // 2. criar esquema
    console.log('\n  → A criar as tabelas...');
    const sql = readFileSync(join(__dirname, '..', 'drizzle', 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('  ✓ Tabelas criadas.');

    // 3. parceiros iniciais
    console.log('  → A registar os parceiros iniciais...');
    const parceiros = [
      { nome: 'Fuel Injection', prefixo: 'FI', cat: 'Oficina e performance' },
      { nome: 'The Shine', prefixo: 'TS', cat: 'Detailing' },
    ];
    for (const p of parceiros) {
      const r = await pool.query(
        `INSERT INTO parceiro (tipo,nome,prefixo,categoria,localizacao,logo_url,contacto_email,estado)
         VALUES ('ponto_de_venda',$1,$2,$3,'Maputo','',$4,'incompleto')
         ON CONFLICT (prefixo) DO NOTHING RETURNING id`,
        [p.nome, p.prefixo, p.cat, `${p.prefixo.toLowerCase()}@fuelinjectiontech.com`]
      );
      if (r.rowCount > 0) console.log(`    · ${p.nome} (${p.prefixo})`);
    }

    console.log('\n  ✓ Pronto. A base de dados está montada.\n');
    console.log('    Os parceiros ficam em estado "incompleto" até carregarem');
    console.log('    logótipo e morada no portal — aí passam a "activo".\n');
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error('\n  ✗ Erro no setup:', e.message, '\n');
  process.exit(1);
});
