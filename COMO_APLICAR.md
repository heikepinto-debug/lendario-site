# O que mudou e como aplicar

Comparei o teu repositório (o que está no GitHub e no Vercel) com a versão nova.
**Não alteraste nada** — o teu repo é o primeiro pacote, intacto. Por isso só
precisas de **acrescentar** ficheiros novos e **substituir** dois.

Nada aqui apaga trabalho teu. Já testei este delta aplicado sobre o teu repo
exacto: o build passa limpo.

---

## Passo 1 — Copiar os ficheiros para o teu projecto

Esta pasta tem a mesma estrutura do teu projecto. Copia tudo para a raiz do teu
repositório, deixando sobrepor. Em concreto:

### Ficheiros NOVOS (16) — nunca existiram, entram sem conflito
```
vercel.json
SETUP_BASE_DADOS.md
drizzle/003_parceiros_e_youtube.sql
drizzle/004_parceiros_com_senha.sql
scripts/senha-parceiro.mjs
src/lib/auth.js
src/lib/sessao.js
src/lib/youtube.js
src/app/parceiro/page.js
src/app/parceiro/parceiro.module.css
src/app/parceiro/painel/page.js
src/app/parceiro/painel/painel-cliente.js
src/app/api/parceiro/login/route.js
src/app/api/parceiro/logout/route.js
src/app/api/parceiro/metricas/route.js
src/app/api/parceiro/perfil/route.js
src/app/api/episodios/sync/route.js
```

### Ficheiros a SUBSTITUIR (2) — versões novas
```
src/app/page.js            (agora lê parceiros e episódios da base de dados)
src/app/page.module.css    (uma linha nova, para o logótipo)
```

Se usas Git no terminal, isto é: copiar por cima, depois `git add -A` e ver no
`git status` que só aparecem estes 18 ficheiros (16 novos + 2 modificados).

---

## Passo 2 — Correr os SQL na Neon

No SQL Editor da Neon, cola e corre, por esta ordem:

1. `drizzle/003_parceiros_e_youtube.sql`
2. `drizzle/004_parceiros_com_senha.sql`

(São seguros de correr mesmo que já tenhas corrido algo antes — têm `IF NOT EXISTS`
e `ON CONFLICT`.)

Isto cria: login de parceiros, cache dos vídeos, e os dois parceiros com senha.

**Senhas provisórias:**
- Fuel Injection · fi@fuelinjectiontech.com · `LendarioFI2026`
- The Shine · ts@fuelinjectiontech.com · `LendarioTS2026`

---

## Passo 3 — Publicar

`git push`. O Vercel republica sozinho.

Depois do deploy, abre uma vez no browser para puxar os vídeos do YouTube:
```
https://<o-teu-site>/api/episodios/sync
```

---

## O que fica a funcionar

- **Portal do parceiro** em `/parceiro` — login, painel com números, upload de logo.
- **Logos na landing** — quando o parceiro carrega o logótipo, aparece no site.
- **Vídeos automáticos** — a lista de episódios actualiza-se sozinha de 6 em 6 horas.

## Verificação rápida depois do deploy

- `/parceiro` → entra com uma das senhas acima → vês o painel.
- No painel, carrega um logótipo → o parceiro fica "activo" → aparece na landing.
- `/` → confirmas os episódios do YouTube na coluna da direita.
