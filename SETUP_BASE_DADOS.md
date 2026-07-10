# Montar a base de dados — passo a passo (sem terminal)

Tudo pelo **SQL Editor da Neon**. Abre o teu projecto na Neon → SQL Editor.
Corre os ficheiros por esta ordem, colando o conteúdo de cada um e carregando em "Run":

## 1. `drizzle/schema.sql`
Cria as tabelas principais. **(já fizeste isto)**

## 2. `drizzle/003_parceiros_e_youtube.sql`
Acrescenta: login de parceiros + cache dos vídeos do YouTube.

## 3. `drizzle/004_parceiros_com_senha.sql`
Cria os dois parceiros (Fuel Injection, The Shine) já com senha de acesso.

**Senhas provisórias** (troca depois de entrares):

| Parceiro | Email | Senha |
|---|---|---|
| Fuel Injection | fi@fuelinjectiontech.com | LendarioFI2026 |
| The Shine | ts@fuelinjectiontech.com | LendarioTS2026 |

Pronto. A base de dados está montada.

---

## Trocar a senha de um parceiro (quando quiseres)

Diz-me a nova senha e eu gero-te o SQL para colar. Não precisas de terminal.
(Ou, se preferires, corre `node scripts/senha-parceiro.mjs FI "nova-senha"`.)

## Adicionar um novo parceiro mais tarde

Diz-me o nome e o prefixo (2 letras), e eu preparo o SQL pronto a colar.
