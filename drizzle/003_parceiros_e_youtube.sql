-- Migração 003: login de parceiros + cache de episódios do YouTube.
-- Cola no SQL Editor da Neon e corre, depois do schema.sql.

-- ---------- senha do parceiro ----------
-- A senha é guardada como hash (scrypt). Nunca em claro.
ALTER TABLE parceiro ADD COLUMN IF NOT EXISTS senha_hash text;

-- ---------- sessões do portal do parceiro ----------
CREATE TABLE IF NOT EXISTS sessao_parceiro (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parceiro_id uuid        NOT NULL REFERENCES parceiro(id),
  token_hash  text        NOT NULL UNIQUE,      -- hash do token do cookie
  expira_em   timestamptz NOT NULL,
  criado_em   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sessao_parceiro ON sessao_parceiro(parceiro_id);

-- ---------- cache dos episódios do YouTube ----------
-- Uma linha por vídeo da playlist. O site lê daqui; um job actualiza de tempos
-- a tempos. Se o YouTube estiver em baixo, o site mostra a última versão guardada.
CREATE TABLE IF NOT EXISTS episodio (
  video_id     text PRIMARY KEY,
  titulo       text        NOT NULL,
  thumbnail    text,
  publicado_em timestamptz,
  posicao      int,                             -- ordem na playlist
  actualizado_em timestamptz NOT NULL DEFAULT now()
);

-- marca da última sincronização, para o site saber se o cache está fresco
CREATE TABLE IF NOT EXISTS sync_estado (
  chave         text PRIMARY KEY,
  ultima_sync   timestamptz,
  ultimo_erro   text
);
