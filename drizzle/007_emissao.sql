-- Migração 007: emissão de vouchers no balcão.
-- Cola no SQL Editor da Neon e corre, depois das anteriores.

-- ---------- emissão ----------
-- Cada vez que o atendente entrega vouchers numa venda, cria-se uma emissão.
-- Guarda o valor da factura, o nº/descrição, e quem estava no balcão — para o
-- dono do negócio auditar os seus atendentes, e para o admin auditar o parceiro.
CREATE TABLE IF NOT EXISTS emissao (
  id             bigserial PRIMARY KEY,
  parceiro_id    uuid        NOT NULL REFERENCES parceiro(id),
  lote_id        uuid        NOT NULL REFERENCES lote(id),
  valor_factura  int         NOT NULL,            -- em MZN
  factura_ref    text,                            -- nº de factura / descrição do serviço
  n_vouchers     int         NOT NULL,            -- quantos vouchers saíram
  atendente      text,                            -- nome/identificação de quem emitiu
  criado_em      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_emissao_parceiro ON emissao(parceiro_id, criado_em DESC);

-- Ligar cada código à emissão que o entregou (NULL = ainda não emitido, está no lote).
ALTER TABLE codigo ADD COLUMN IF NOT EXISTS emissao_id bigint REFERENCES emissao(id);
ALTER TABLE codigo ADD COLUMN IF NOT EXISTS emitido_em timestamptz;
CREATE INDEX IF NOT EXISTS idx_codigo_emissao ON codigo(emissao_id);

-- Estado do código ganha um significado mais rico:
--   por_activar + emissao_id NULL  → existe no lote, ainda não entregue
--   por_activar + emissao_id != NULL → entregue ao cliente, à espera de registo
--   activado                        → registado (já é entrada no sorteio)
