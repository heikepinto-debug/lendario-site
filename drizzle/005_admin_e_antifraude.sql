-- Migração 005: administração e anti-fraude.
-- Cola no SQL Editor da Neon e corre, depois das anteriores.

-- ---------- conta de administração ----------
-- Uma conta única (ou poucas) para o Heike gerir o sorteio.
CREATE TABLE IF NOT EXISTS admin (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text        NOT NULL UNIQUE,
  senha_hash  text        NOT NULL,
  nome        text        NOT NULL,
  criado_em   timestamptz NOT NULL DEFAULT now()
);

-- sessões do admin (mesma mecânica das do parceiro)
CREATE TABLE IF NOT EXISTS sessao_admin (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id   uuid        NOT NULL REFERENCES admin(id),
  token_hash text        NOT NULL UNIQUE,
  expira_em  timestamptz NOT NULL,
  criado_em  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sessao_admin ON sessao_admin(admin_id);

-- ---------- alertas de fraude ----------
-- O sistema regista aqui sinais que merecem o olhar do Heike. Não bloqueia nada
-- sozinho — só sinaliza. O Heike decide.
CREATE TABLE IF NOT EXISTS alerta (
  id          bigserial PRIMARY KEY,
  tipo        text        NOT NULL,   -- 'tecto_pessoa', 'baixa_activacao', 'emissao_rapida'
  gravidade   text        NOT NULL DEFAULT 'media',  -- 'baixa', 'media', 'alta'
  entidade    text        NOT NULL,   -- 'participante' | 'parceiro'
  entidade_id text        NOT NULL,
  detalhe     jsonb,
  resolvido   boolean     NOT NULL DEFAULT false,
  criado_em   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_alerta_aberto ON alerta(resolvido, criado_em DESC);

-- evita alertas duplicados do mesmo tipo para a mesma entidade enquanto aberto
CREATE UNIQUE INDEX IF NOT EXISTS idx_alerta_unico
  ON alerta(tipo, entidade, entidade_id) WHERE resolvido = false;
