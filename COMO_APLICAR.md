# Actualizar só os Termos e Condições

Um único ficheiro a substituir. Já tens o delta8 aplicado, por isso todo o resto
(link no rodapé, checkbox no registo, idade 18+) já funciona — só o TEXTO dos
termos é que muda: passa da versão rascunho para a versão final.

## Ficheiro a substituir
```
src/app/termos/page.js
```

## Como aplicar (o mais fácil: direto no GitHub)
1. No GitHub, abre `src/app/termos/page.js`.
2. Lápis (✏️) para editar.
3. Apaga tudo e cola o conteúdo do ficheiro deste pacote.
4. "Commit changes". O Vercel republica sozinho.

Ou pelo GitHub Desktop: substitui o ficheiro, commit + push.

## O que muda
- Sai o aviso de "rascunho" do topo.
- Ficam preenchidos: limite de 30 entradas por pessoa, 3 suplentes, prazo de
  reclamação de 30 dias, prazos de 6 meses (livery e não-venda), residência
  em Moçambique, data "Novembro de 2026".
- A via gratuita foi removida.

## Não esquecer (para ti, depois)
Estes T&C ainda devem ir ao teu jurista para fechar: a questão fiscal do prémio,
a exequibilidade da cláusula 9.2 (proibição de venda), e confirmar se Moçambique
exige mesmo uma via de participação gratuita. Nada disto impede pôr no ar — mas
não os consideres definitivos até validares esses pontos.
