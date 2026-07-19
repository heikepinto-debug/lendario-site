# Motor do sorteio + cerimónia ao vivo  (+ T&C finais)

A peça que faltava: extrair o vencedor, de forma que ninguém possa pôr em causa.
Inclui também os T&C na versão final (que ainda não tinhas aplicado).

## Ficheiros

**Novos:**
```
src/lib/sorteio.js                      o motor (compromisso, extracção, verificação)
src/app/live/page.js                    página da cerimónia
src/app/live/live-cliente.js
src/app/live/live.module.css
src/app/api/admin/sorteio/route.js      fechar / sortear (só admin)
src/app/api/live/sorteio/route.js       estado público (para /live e para verificação)
drizzle/009_sorteio.sql
```

**A substituir:**
```
src/app/admin/painel/painel-cliente.js  (+ bloco "O sorteio")
src/app/admin/admin.module.css
src/app/termos/page.js                  (versão final dos T&C)
src/app/termos/termos.module.css
```

## Passos

### 1. SQL na Neon
`drizzle/009_sorteio.sql`

ATENÇÃO — lê isto: o esquema original já tinha uma tabela `sorteio`, criada de
raiz mas nunca usada. O desenho dela não serve (não guarda o compromisso público
e só prevê 2 suplentes, quando os T&C dizem 3). Esta migração substitui-a, mas
**só se estiver vazia** — se tiver algum sorteio registado, pára com erro e não
destrói nada. Como nunca correste um sorteio, deve passar sem problema.

### 2. Código
GitHub Desktop: copia tudo, commit + push.

---

## Como funciona o sorteio (importante perceberes)

O problema: como é que alguém acredita que não escolheste o vencedor?
A resposta é **compromisso prévio**. São dois momentos:

### Momento 1 — FECHAR (fazes isto quando os registos terminarem)
No painel de admin, "Fechar o sorteio". A partir daí:
- A lista de bilhetes **congela** e calcula-se a sua impressão digital (lista_hash).
- Gera-se uma semente secreta e publica-se **só o hash dela** (semente_hash).
- Ambos ficam visíveis em /live, ANTES da extracção.

O que isto garante: já não podes acrescentar bilhetes (mudaria o lista_hash) nem
trocar a semente (mudaria o semente_hash). Estás preso ao que publicaste.

### Momento 2 — SORTEAR (no palco, ao vivo)
No painel, "CORRER O SORTEIO". O sistema:
- Confirma que a lista não mudou desde o fecho (se mudou, **recusa correr**).
- Revela a semente e faz a conta: vencedor + 3 suplentes.
- A página /live revela sozinha, com 4 segundos de suspense.

### Depois — qualquer pessoa verifica
Com o CSV das entradas (o teu botão "exportar"), a semente revelada e os hashes
publicados, qualquer pessoa refaz a conta e chega ao mesmo vencedor. Se tivesses
batoteado, as contas não fechavam.

## A página /live

`o-teu-site/live` — feita para ecrã grande e transmissão. Escala sozinha do
telemóvel ao ecrã de 4 metros. Três estados, muda sozinha:
- **Aberto** → contador de entradas ao vivo
- **Fechado** → total de bilhetes + o compromisso público
- **Sorteado** → suspense, depois o bilhete vencedor e os suplentes

Podes abri-la no ecrã do palco e na transmissão ao mesmo tempo. Não precisa de
ninguém a carregar em nada: quando corres o sorteio no painel, ela revela sozinha.

## No dia — sugestão de guião

1. Antes: "Fechar o sorteio" no painel. Mostra o /live com o compromisso.
2. Explica ao público: "a semente já está selada, nem nós sabemos quem ganha".
3. No momento: "CORRER O SORTEIO" (pede confirmação escrita — não há enganos).
4. O /live faz o suspense e revela.
5. Depois: a semente fica pública. Quem quiser, confirma.

## Salvaguarda
O botão "exportar CSV" continua a ser a tua rede de segurança. **Descarrega o CSV
depois de fechares** — é a lista oficial, e é com ela que a verificação se faz.

## Testado
- Determinismo (mesma semente = mesmo vencedor, sempre)
- Sem repetições (ninguém sai duas vezes)
- Aleatoriedade: teste qui-quadrado com 100.000 sorteios — uniforme
- Sem favorecimento: 200.000 sorteios, nenhum bilhete sistematicamente à frente
- Detecção de batota: acrescentar bilhete ou trocar semente são ambos apanhados
- Fluxo completo com 500 entradas de 200 pessoas
