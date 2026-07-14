# Emissão de vouchers + T&C + idade 18+ + auditoria de participantes

Pacote combinado. Junta tudo o que ainda não aplicaste (o "delta7" da emissão)
com as novidades: Termos e Condições no site, confirmação de 18+ no registo, e
auditoria de participantes por parceiro no painel de admin.

Aplica-se sobre o teu repo com o delta6 (admin) já aplicado — que é o teu caso.

## IMPORTANTE: dependências novas

Adiciona duas bibliotecas (pdf-lib, qrcode), já no `package.json` incluído.
**Substitui o teu `package.json` pelo deste delta**, senão o build falha.

## Ficheiros (22)

**Novos:**
```
src/lib/emissao.js                         lógica de emissão
src/lib/pdf-voucher.js                     gera o PDF com QR
src/app/api/admin/lotes/route.js           admin dá lotes
src/app/api/admin/participantes/route.js   auditoria de participantes
src/app/api/parceiro/emitir/route.js       parceiro emite + PDF
src/app/api/parceiro/emissoes/route.js     histórico de emissões
src/app/parceiro/painel/emitir-vouchers.js interface de emissão
src/app/termos/page.js                     página de Termos e Condições
src/app/termos/termos.module.css
drizzle/007_emissao.sql
drizzle/008_idade_e_tc.sql
```

**A substituir:**
```
package.json                               (+ pdf-lib, qrcode)
src/lib/registar.js                        (+ idade 18+, aceitação T&C)
src/lib/config.js                          (+ idade mínima, versão T&C)
src/app/registar/page.js                   (+ data nascimento, link T&C)
src/app/registar/registar.module.css
src/app/admin/painel/painel-cliente.js     (+ dar lotes, + registos por parceiro)
src/app/admin/admin.module.css
src/app/parceiro/painel/painel-cliente.js  (+ emitir vouchers)
src/app/parceiro/parceiro.module.css
src/app/page.js                            (+ link T&C no rodapé)
src/app/page.module.css
```

## Passos

### 1. SQL na Neon (por esta ordem)
- `drizzle/007_emissao.sql`   → emissão de vouchers
- `drizzle/008_idade_e_tc.sql` → data de nascimento + registo de aceitação dos T&C

### 2. Código
GitHub Desktop: copia tudo (inclui o package.json), commit + push.

## O que passa a funcionar

**Emissão de vouchers** (como falámos):
- Admin dá lotes (+50/+100/+200) a cada parceiro no painel.
- Parceiro emite no balcão: mete o valor → calcula os vouchers → gera PDF com
  QR, link, código, data e nome do projecto. Regista valor + factura + atendente.

**Termos e Condições:**
- Página em `/termos` (e link no rodapé da landing).
- No registo, o participante tem de aceitar os T&C (checkbox liga à página).

**Idade 18+:**
- O registo pede a data de nascimento e recusa quem não tenha 18 anos.
- Fica guardado que aceitou os T&C e qual a versão.

**Auditoria de participantes** (novo bloco no painel de admin):
- "Registos por parceiro": de onde vêm os participantes — entradas e pessoas
  distintas por loja.
- Quantos aceitaram marketing, do total.

## Sobre os T&C — LÊ ISTO

Passei o teu documento para uma página do site, mas com pontos por fechar com o
teu jurista. A página tem um aviso de "rascunho" bem visível. O mais importante:

1. **Via gratuita (sem compra)** — o teu jurista marcou isto a vermelho. Em MZ
   pode ser exigida uma forma de participar sem comprar. Se ele confirmar que sim,
   o sistema TEM de mudar (permitir uma entrada sem voucher). NÃO publiques os T&C
   como definitivos até fechares este ponto.
2. **Limite por pessoa** — pus "existe um limite" no texto. Nós definimos 30.
   Confirma com ele se queres o número explícito no documento.
3. **Prazos das cláusulas 9.1/9.2** (manter livery, não vender) — deixei "a definir".
   Diz-me os prazos e eu preencho.
4. **Data** — está "Novembro de 2026" sem dia, a condizer com o site.

Quando tiveres a versão final do jurista, dá-ma e actualizo a página exacta.
A `TC_VERSAO` no config muda para a versão nova, e fica registado quem aceitou qual.
