// Ligação à base de dados (Neon Postgres).
//
// Usa o driver serverless da Neon sobre WebSocket, porque o registo precisa de
// uma transacção interactiva (BEGIN → SELECT FOR UPDATE → ... → COMMIT), que o
// modo HTTP não suporta. Em serverless, o Pool é criado e fechado dentro de
// cada operação — nunca partilhado entre pedidos.

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Fora do browser, o driver precisa de um construtor de WebSocket.
if (typeof WebSocket === 'undefined' && !neonConfig.webSocketConstructor) {
  neonConfig.webSocketConstructor = ws;
}

function makePool() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL não definido');
  return new Pool({ connectionString: url });
}

// Query simples: abre, corre, fecha.
export async function query(text, params) {
  const pool = makePool();
  try {
    return await pool.query(text, params);
  } finally {
    await pool.end();
  }
}

// Transacção interactiva. `fn` recebe um cliente e corre entre BEGIN e COMMIT;
// qualquer erro faz ROLLBACK. É a mesma ligação do princípio ao fim — o que faz
// o FOR UPDATE funcionar.
export async function transaction(fn) {
  const pool = makePool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch { /* ignora */ }
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}
