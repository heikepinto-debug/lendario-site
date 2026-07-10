-- Cria os dois parceiros iniciais COM senha de acesso ao portal.
-- Cola no SQL Editor da Neon e corre (depois do schema.sql e do 003).
--
-- Senhas provisórias (troca-as depois de entrares a primeira vez):
--   Fuel Injection  →  email: fi@fuelinjectiontech.com  senha: LendarioFI2026
--   The Shine       →  email: ts@fuelinjectiontech.com  senha: LendarioTS2026

INSERT INTO parceiro (tipo, nome, prefixo, categoria, localizacao, logo_url, contacto_email, estado, senha_hash)
VALUES
  ('ponto_de_venda', 'Fuel Injection', 'FI', 'Oficina e performance', 'Maputo', '',
   'fi@fuelinjectiontech.com', 'incompleto',
   'scrypt$a2d8bf1cef153cdd758aa0ad275d270c$b8737ec740afea1cdb2295f0983ae626fde82dc6ad9c5cd00bef7df391d5cfa221211306f40c22c663faa92b29d4669bd2aa630f9d5963e895a6cbc9d0a44e72'),
  ('ponto_de_venda', 'The Shine', 'TS', 'Detailing', 'Maputo', '',
   'ts@fuelinjectiontech.com', 'incompleto',
   'scrypt$ef6e6943e11b36481ee6e2fae8415d39$68388890ce3b3a944c44c48e87a6cd0b1c7915cba96b19ae9d9e0408f355fb9ab2a6ed46676524195dbbcbc24a891c14f22bfc02bbace18dbdf16def11f18df6')
ON CONFLICT (prefixo) DO UPDATE SET senha_hash = EXCLUDED.senha_hash;
