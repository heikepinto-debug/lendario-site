# Correcção: ordem/número dos episódios + alinhamento do botão

Os mesmos **2 ficheiros** de sempre. Substituir.

```
src/app/page.js            (numeração e ordem dos episódios pela data real)
src/app/page.module.css    (botão "Área de parceiros" alinhado no menu)
```

## O que corrige

- **Episódios:** o vídeo mais antigo é sempre o **EP 01**; a lista mostra do
  mais recente (em cima, marcado "novo") para o mais antigo (em baixo). O número
  já não depende da ordem em que o YouTube devolve os vídeos.
- **Botão:** "Área de parceiros" fica alinhado certinho com os outros itens do menu.

## Aplicar

Direto no GitHub (lápis → colar → commit) nos 2 ficheiros, ou pelo GitHub Desktop.
O Vercel publica sozinho em 1-2 minutos.

Depois do deploy, se quiseres ver a ordem corrigida na hora sem esperar,
abre `/api/episodios/sync` uma vez no browser.
