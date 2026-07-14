-- Migração 006: cria a conta de administração do Heike.
-- Cola no SQL Editor da Neon e corre, depois da 005.
--
-- Login do admin:
--   email: admin@fuelinjectiontech.com
--   senha: LendarioAdmin2026   (troca depois de entrares a primeira vez)

INSERT INTO admin (email, senha_hash, nome)
VALUES (
  'heike.pinto@fuelinjectiontech.com',
  'scrypt$5a44dbb39dc39cd7e2099da80fb84081$d63c7b81e642b69520be5ef738b58e9487dfa1b8fe63e03fccba55ea9adf52f250cd5af50e5543d480b8361099e3e78930af3868724b5bea8a38ad390dc38153',
  'Heike Pinto'
)
ON CONFLICT (email) DO NOTHING;
