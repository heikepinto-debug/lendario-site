# Actualização: episódios por data + botão de parceiro no menu

Só **2 ficheiros** mudam. Ambos existem já no teu repo — é substituir.

## Ficheiros a substituir
```
src/app/page.js            (episódio "novo" agora é o de data mais recente
                            + link "Área de parceiros" no menu de topo)
src/app/page.module.css    (estilo do botão de parceiro)
```

## Como aplicar (o mais fácil: direto no GitHub)

Para cada um dos 2 ficheiros:
1. Abre o ficheiro no GitHub.
2. Lápis (✏️) para editar.
3. Substitui pelo conteúdo da mesma pasta neste delta.
4. "Commit changes".

Ou, pelo GitHub Desktop: copia os 2 ficheiros por cima, commit + push.

## O que muda no site

- No menu do topo aparece **"Área de parceiros"** (botão verde), que leva ao login.
- Na lista de episódios, o rótulo **"novo"** passa a marcar o vídeo com a
  data de publicação mais recente (em vez do primeiro da lista).

O deploy já está a funcionar, por isso ao fazer commit o Vercel publica sozinho
em 1-2 minutos.

## Nota

O `vercel.json` já o corrigiste no GitHub (o cron diário). Não precisas de mexer
nele outra vez — só nestes 2 ficheiros.
