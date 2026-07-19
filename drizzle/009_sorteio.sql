-- Migração 009: motor do sorteio (compromisso prévio + verificação pública).
-- Cola no SQL Editor da Neon e corre, depois das anteriores.
--
-- NOTA: o esquema original já tinha uma tabela `sorteio`, criada de raiz mas
-- nunca usada. O desenho dela não serve para o que precisamos: não guarda o
-- compromisso público (hash da semente publicado ANTES da extracção) e só
-- prevê 2 suplentes, quando os T&C falam em 3.
--
-- Esta migração substitui-a — mas SÓ se estiver vazia. Se por algum motivo já
-- tiver um sorteio registado, pára com erro e não destrói nada.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sorteio') THEN
    IF (SELECT count(*) FROM sorteio) > 0 THEN
      RAISE EXCEPTION 'A tabela sorteio tem % registo(s). Não é seguro recriá-la automaticamente.', (SELECT count(*) FROM sorteio);
    END IF;
    DROP TABLE sorteio CASCADE;
  END IF;
END $$;

-- ---------- o sorteio ----------
-- Um registo por sorteio. Guarda o compromisso público (publicado ANTES da
-- extracção) e, depois, a semente revelada. É isto que torna o sorteio
-- verificável: qualquer pessoa refaz a conta e chega ao mesmo vencedor.
CREATE TABLE sorteio (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome           text        NOT NULL,
  estado         text        NOT NULL DEFAULT 'aberto',
    -- 'aberto'   → ainda a receber entradas
    -- 'fechado'  → lista congelada, compromisso publicado, à espera da extracção
    -- 'sorteado' → extracção feita, semente revelada
  total_entradas int,
  lista_hash     text,       -- impressão digital da lista de bilhetes (SHA-256)
  semente        text,       -- semente secreta (só exposta ao público após a extracção)
  semente_hash   text,       -- SHA-256 da semente — PUBLICADO ANTES da extracção
  fechado_em     timestamptz,
  sorteado_em    timestamptz,
  criado_em      timestamptz NOT NULL DEFAULT now()
);

-- ---------- resultado ----------
-- Vencedor (posicao 0) e suplentes (1, 2, 3), pela ordem de extracção.
CREATE TABLE sorteio_resultado (
  id              bigserial PRIMARY KEY,
  sorteio_id      uuid        NOT NULL REFERENCES sorteio(id),
  posicao         int         NOT NULL,          -- 0 = vencedor, 1..n = suplentes
  entrada_id      bigint      NOT NULL REFERENCES entrada(id),
  bilhete         text        NOT NULL,
  participante_id uuid        NOT NULL REFERENCES participante(id),
  criado_em       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sorteio_id, posicao)
);
CREATE INDEX IF NOT EXISTS idx_resultado_sorteio ON sorteio_resultado(sorteio_id, posicao);
