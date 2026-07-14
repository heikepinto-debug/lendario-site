# Painel de administração + anti-fraude

Peça grande e nova. Traz o painel de admin completo e as defesas anti-fraude que
falámos: tecto por pessoa, alertas, e auditoria dos parceiros.

## Ficheiros

**Novos:**
```
src/lib/admin-auth.js                       login do admin
src/lib/admin-sessao.js                     sessão do admin
src/app/admin/page.js                       página de login
src/app/admin/admin.module.css              estilos
src/app/admin/painel/page.js                painel (protegido)
src/app/admin/painel/painel-cliente.js      painel (interface)
src/app/api/admin/login/route.js
src/app/api/admin/logout/route.js
src/app/api/admin/resumo/route.js
src/app/api/admin/alertas/route.js
src/app/api/admin/exportar/route.js
drizzle/005_admin_e_antifraude.sql
drizzle/006_criar_admin.sql
```

**A substituir:**
```
src/lib/registar.js    (passa a aplicar o tecto por pessoa + gerar alertas)
src/lib/config.js      (tecto = 30 entradas por pessoa, alerta aos 20)
```

## Passos

### 1. SQL na Neon (por esta ordem)
- `drizzle/005_admin_e_antifraude.sql`  → tabelas de admin, sessões e alertas
- `drizzle/006_criar_admin.sql`         → cria a tua conta de admin

### 2. Código
Copia os ficheiros (GitHub Desktop é mais fácil), commit + push. O Vercel publica.

### 3. Entrar
```
o-teu-site/admin
```
- email: admin@fuelinjectiontech.com
- senha: LendarioAdmin2026  ← troca depois (diz-me a nova e gero o SQL)

## O que o painel faz

- **Totais** — entradas, participantes, parceiros activos, alertas por rever.
- **Salvaguarda** — botão para descarregar todas as entradas em CSV. Guarda isto
  antes do sorteio: com ele, o sorteio corre mesmo sem internet no dia.
- **Alertas** — sinaliza pessoas que se aproximam do tecto. Tu marcas "visto".
- **Parceiros** — mostra a taxa de activação de cada um (vouchers emitidos vs.
  mesmo usados). Uma taxa muito baixa com muitos vouchers = sinal de aviso.
- **Quem tem mais entradas** — top de pessoas por nº de entradas.

## As defesas anti-fraude (o que decidimos)

- **Tecto de 30 entradas por pessoa** (por telefone). Alguém que tente passar disto
  é bloqueado. 30 = seis compras grandes de 25.000+ MZN — nunca incomoda um
  comprador real, só o abuso óbvio.
- **Alerta aos 20** — quem chega perto do tecto aparece no teu painel para reveres.
- **Sem fricção no balcão** — não pedimos factura ao parceiro, como querias. A
  defesa contra vouchers inflacionados é a auditoria (taxa de activação) + o
  limite de lote que já existe (primeiro lote automático, seguintes com a tua
  aprovação).

Se quiseres mudar o tecto (30) ou o limiar de alerta (20), estão no topo do
`src/lib/config.js` — dois números.
