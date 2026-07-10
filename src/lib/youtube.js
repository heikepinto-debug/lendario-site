// Episódios do YouTube — lê o feed RSS da playlist e guarda em cache na BD.
//
// Sem chave de API: o YouTube expõe um feed Atom por playlist em
// /feeds/videos.xml?playlist_id=... . Mostra os ~15 vídeos mais recentes,
// que é o que precisamos para "os últimos episódios".
//
// O site lê sempre da BD (rápido, e resiste a falhas do YouTube). Um refresh
// periódico actualiza o cache.

import { query } from './db.js';
import { CONFIG } from './config.js';

const FEED_URL = `https://www.youtube.com/feeds/videos.xml?playlist_id=${CONFIG.YOUTUBE_PLAYLIST_ID}`;

// Extrai os campos de cada <entry> do Atom, sem dependências de parsing.
function parseFeed(xml) {
  const entries = [];
  const blocks = xml.split('<entry>').slice(1);
  for (const b of blocks) {
    const videoId = pick(b, 'yt:videoId');
    const titulo = decode(pick(b, 'title'));
    const publicado = pick(b, 'published');
    // thumbnail vem em <media:thumbnail url="...">
    const thumb = (b.match(/<media:thumbnail\s+url="([^"]+)"/) || [])[1] || null;
    if (videoId && titulo) {
      entries.push({ videoId, titulo, publicado, thumb });
    }
  }
  return entries;
}

function pick(block, tag) {
  const m = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return m ? m[1].trim() : null;
}

function decode(s) {
  if (!s) return s;
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'");
}

// Vai buscar ao YouTube e actualiza o cache. Chamado pelo endpoint de refresh.
export async function sincronizarEpisodios() {
  let xml;
  try {
    const r = await fetch(FEED_URL, { headers: { 'user-agent': 'lendario/1.0' } });
    if (!r.ok) throw new Error('YouTube devolveu ' + r.status);
    xml = await r.text();
  } catch (err) {
    await query(
      `INSERT INTO sync_estado (chave, ultima_sync, ultimo_erro) VALUES ('youtube', now(), $1)
       ON CONFLICT (chave) DO UPDATE SET ultimo_erro = $1`,
      [String(err.message)]
    );
    throw err;
  }

  const entries = parseFeed(xml);
  let pos = 0;
  for (const e of entries) {
    await query(
      `INSERT INTO episodio (video_id, titulo, thumbnail, publicado_em, posicao, actualizado_em)
       VALUES ($1, $2, $3, $4, $5, now())
       ON CONFLICT (video_id) DO UPDATE
         SET titulo = $2, thumbnail = $3, publicado_em = $4, posicao = $5, actualizado_em = now()`,
      [e.videoId, e.titulo, e.thumb, e.publicado || null, pos++]
    );
  }
  await query(
    `INSERT INTO sync_estado (chave, ultima_sync, ultimo_erro) VALUES ('youtube', now(), NULL)
     ON CONFLICT (chave) DO UPDATE SET ultima_sync = now(), ultimo_erro = NULL`
  );
  return entries.length;
}

// Lê os episódios do cache (para a landing). Mais recentes primeiro.
export async function listarEpisodios(limite = 6) {
  const r = await query(
    'SELECT video_id, titulo, thumbnail, publicado_em FROM episodio ORDER BY posicao ASC LIMIT $1',
    [limite]
  );
  return r.rows;
}
