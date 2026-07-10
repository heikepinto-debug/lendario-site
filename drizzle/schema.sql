-- Cansado → Lendário · Fase 1 · esquema inicial
-- Postgres 14+. Requer extensões citext e pgcrypto.
--
-- Filosofia: as garantias críticas vivem na base de dados, não na aplicação.
-- Uso único de código, unicidade de telefone/email e imutabilidade da auditoria
-- são impostos aqui, onde nenhum bug de aplicação lhes pode passar por cima.

BEGIN;

CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- enums ----------
CREATE TYPE tipo_parceiro    AS ENUM ('patrocinador', 'ponto_de_venda');
CREATE TYPE estado_parceiro  AS ENUM ('pendente', 'incompleto', 'activo', 'suspenso');
CREATE TYPE estado_lote      AS ENUM ('pendente', 'aprovado', 'rejeitado');
CREATE TYPE estado_codigo    AS ENUM ('por_activar', 'activado', 'anulado');
CREATE TYPE via_entrada      AS ENUM ('qr', 'link', 'manual');

-- ---------- parceiro ----------
CREATE TABLE parceiro (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo            tipo_parceiro   NOT NULL,
  nome            text            NOT NULL,
  prefixo         text            NOT NULL UNIQUE
                    CHECK (prefixo ~ '^[A-Z]{2,4}$'),
  categoria       text,
  localizacao     text,
  logo_url        text,
  link            text,
  contacto_email  citext          NOT NULL UNIQUE,
  estado          estado_parceiro NOT NULL DEFAULT 'pendente',
  criado_em       timestamptz     NOT NULL DEFAULT now()
);

-- Um parceiro só pode estar 'activo' se tiver o essencial preenchido.
-- Esta restrição impede que um parceiro incompleto apareça no site ou valide códigos.
ALTER TABLE parceiro ADD CONSTRAINT parceiro_activo_completo CHECK (
  estado <> 'activo'
  OR (categoria IS NOT NULL AND localizacao IS NOT NULL AND logo_url IS NOT NULL)
);

-- ---------- lote ----------
CREATE TABLE lote (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parceiro_id  uuid        NOT NULL REFERENCES parceiro(id),
  quantidade   int         NOT NULL CHECK (quantidade BETWEEN 1 AND 500),
  estado       estado_lote NOT NULL DEFAULT 'pendente',
  automatico   boolean     NOT NULL DEFAULT false,
  aprovado_por uuid,                                   -- FK lógica → admin
  criado_em    timestamptz NOT NULL DEFAULT now(),
  aprovado_em  timestamptz
);
CREATE INDEX idx_lote_parceiro ON lote(parceiro_id);

-- ---------- codigo ----------
CREATE TABLE codigo (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo      text          NOT NULL UNIQUE,
  parceiro_id uuid          NOT NULL REFERENCES parceiro(id),
  lote_id     uuid          NOT NULL REFERENCES lote(id),
  estado      estado_codigo NOT NULL DEFAULT 'por_activar',
  activado_em timestamptz
);
-- 'codigo' é o único caminho de leitura quente (validação no registo).
-- O UNIQUE já cria índice; explicitamos o de parceiro para o rácio emitidos/activados.
CREATE INDEX idx_codigo_parceiro ON codigo(parceiro_id);
CREATE INDEX idx_codigo_lote     ON codigo(lote_id);

-- ---------- participante ----------
CREATE TABLE participante (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome             text        NOT NULL,
  email            citext      NOT NULL UNIQUE,          -- chave de login
  telefone         text        NOT NULL UNIQUE           -- chave de identidade
                     CHECK (telefone ~ '^\+258[0-9]{9}$'),
  consent_sorteio  boolean     NOT NULL CHECK (consent_sorteio = true),
  optin_marketing  boolean     NOT NULL DEFAULT false,
  optin_em         timestamptz,
  criado_em        timestamptz NOT NULL DEFAULT now()
);

-- ---------- entrada (o bilhete) ----------
-- id é bigserial: é o número do bilhete, sequencial e humano (E-00001).
CREATE TABLE entrada (
  id               bigserial PRIMARY KEY,
  participante_id  uuid       NOT NULL REFERENCES participante(id),
  parceiro_id      uuid       NOT NULL REFERENCES parceiro(id),  -- desnormalizado p/ painel
  codigo_id        uuid       NOT NULL UNIQUE REFERENCES codigo(id), -- UNIQUE = uso único real
  via              via_entrada NOT NULL,
  hash_verificacao text       NOT NULL,
  criado_em        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_entrada_participante ON entrada(participante_id);
CREATE INDEX idx_entrada_parceiro     ON entrada(parceiro_id);

-- ---------- token de acesso ----------
CREATE TABLE token_acesso (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       citext      NOT NULL,
  codigo_hash text        NOT NULL,        -- bcrypt do código de 6 dígitos, nunca em claro
  expira_em   timestamptz NOT NULL,
  usado       boolean     NOT NULL DEFAULT false,
  tentativas  int         NOT NULL DEFAULT 0,
  criado_em   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_token_email ON token_acesso(email);

-- ---------- sorteio ----------
-- Uma linha por execução OFICIAL (ensaios não gravam). Nunca alterada, nunca apagada.
CREATE TABLE sorteio (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_execucao     int         NOT NULL,
  cesto_hash          text        NOT NULL,
  total_entradas      int         NOT NULL,
  semente             text        NOT NULL,
  vencedor_entrada_id bigint      NOT NULL REFERENCES entrada(id),
  suplente_1_id       bigint      REFERENCES entrada(id),
  suplente_2_id       bigint      REFERENCES entrada(id),
  executado_em        timestamptz NOT NULL DEFAULT now(),
  executado_por       uuid        NOT NULL
);

-- ---------- auditoria (append-only) ----------
CREATE TABLE auditoria (
  id          bigserial PRIMARY KEY,
  actor       text,
  accao       text        NOT NULL,
  entidade    text,
  entidade_id text,
  valor_antes jsonb,
  valor_depois jsonb,
  ip          inet,
  criado_em   timestamptz NOT NULL DEFAULT now()
);

-- A imutabilidade impõe-se por triggers: mesmo com bug de aplicação,
-- ou mesmo com acesso directo do utilizador da app, não se pode reescrever a história.
CREATE OR REPLACE FUNCTION nega_alteracao() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'auditoria é append-only: % proibido', TG_OP;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auditoria_sem_update BEFORE UPDATE ON auditoria
  FOR EACH ROW EXECUTE FUNCTION nega_alteracao();
CREATE TRIGGER auditoria_sem_delete BEFORE DELETE ON auditoria
  FOR EACH ROW EXECUTE FUNCTION nega_alteracao();

COMMIT;
