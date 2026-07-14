-- Migração 008: idade (18+) e aceitação dos T&C no registo.
-- Cola no SQL Editor da Neon e corre, depois das anteriores.

-- Data de nascimento para confirmar os 18 anos (cláusula 4 dos T&C).
ALTER TABLE participante ADD COLUMN IF NOT EXISTS data_nascimento date;

-- Registo de que aceitou os T&C: a versão aceite e quando.
ALTER TABLE participante ADD COLUMN IF NOT EXISTS tc_versao text;
ALTER TABLE participante ADD COLUMN IF NOT EXISTS tc_aceite_em timestamptz;
