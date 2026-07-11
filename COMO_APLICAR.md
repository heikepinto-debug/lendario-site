# Logos dos parceiros + data "Novembro" + correcções

Este delta traz os 5 logos, a data sem dia, e as correcções dos episódios/botão.
Junta tudo o que estava pendente — aplica só este, esquece os anteriores.

## Ficheiros

**Novos (pasta de logos):**
```
public/parceiros/fuel-injection-mono.png    public/parceiros/fuel-injection-cor.png
public/parceiros/eltel-mono.png             public/parceiros/eltel-cor.png
public/parceiros/jps-mono.png               public/parceiros/jps-cor.png
public/parceiros/galp-mono.png              public/parceiros/galp-cor.png
public/parceiros/the-shine-mono.png         public/parceiros/the-shine-cor.png
```

**A substituir:**
```
src/app/page.js            (logos + data "Novembro" + episódios + botão)
src/app/page.module.css
```

## Como aplicar

Pelo GitHub Desktop é mais fácil desta vez (há ficheiros de imagem):
1. Copia a pasta `public/parceiros/` inteira para o teu projecto.
2. Substitui `src/app/page.js` e `src/app/page.module.css`.
3. Commit + push. O Vercel publica sozinho.

(Se preferires o site do GitHub: os PNG podes arrastá-los para dentro da pasta
`public/parceiros` na interface web, e editar os 2 ficheiros de código como sempre.)

## Trocar entre monocromático e colorido

No `src/app/page.js`, perto do topo, há esta linha:
```
const ESTILO_LOGOS = 'mono';
```
Muda `'mono'` para `'cor'` e volta a publicar. Preparei as duas versões de todos
os logos — trocar é só esta palavra. Vê no teu site qual preferes.

## O que fica

- Os 5 logos na secção de parceiros (Fuel Injection, Eltel, JPS, Galp, The Shine).
- Data em "Novembro" (sem dia).
- Episódios ordenados por data; botão de parceiros alinhado.

Se um parceiro carregar o próprio logo pelo portal, esse tem prioridade sobre
o ficheiro — não há conflito.
