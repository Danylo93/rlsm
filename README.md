# Radicais Livres São Miguel

Site da juventude da Videira São Miguel — um **filme interativo**: a rolagem conta a história.
Rolar para baixo avança, rolar para cima volta, parar de rolar congela o quadro.

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · GSAP + ScrollTrigger · Lenis · Canvas 2D

## Rodar

Requer Node.js ≥ 20.9.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Onde editar o quê

| O quê | Arquivo |
| --- | --- |
| WhatsApp, Instagram, YouTube, endereço, URL do site | `data/site.ts` |
| Eventos (datas, locais, links) — os que já passaram somem sozinhos | `data/eventos.ts` |
| Fotos da galeria e onde cada uma cai no mural | `data/galeria.ts` |
| Roteiro do filme: duração de cada cena, fotos, câmera, luz, transições | `data/cenas.ts` |
| Números da cena 07 | `data/cenas.ts` (`numeros`) |
| Textos de cada cena | `components/sections/*.tsx` |
| Cores e tipografia | `app/globals.css` (`@theme`) |

> ⚠ Os eventos de `data/eventos.ts` são **exemplos** e as fotos atuais são **placeholders**
> (Unsplash, licença livre). Troque pelos reais antes de publicar.

## Trocar as fotos

1. Coloque as fotos originais (JPG grandes) em `fotos-originais/` com os mesmos nomes
   (`hero.jpg`, `geracao.jpg`, `presenca.jpg`, `celula-1.jpg`, …, `g-01.jpg` … `g-12.jpg`).
2. `npm run fotos` — gera WebP para desktop (`public/img/cenas/*.webp`), recortes retrato
   para celular (`*-m.webp`, centrados no foco definido em `scripts/preparar-fotos.mjs`)
   e as fotos da galeria.
3. `npm run og` — refaz a imagem de compartilhamento (WhatsApp/Instagram).

A cena PRESENÇA usa uma camada recortada (`presenca-frente.webp`) para a palavra passar
**por trás** das pessoas. O recorte é automático (silhuetas escuras contra luz) e configurável
em `scripts/preparar-fotos.mjs` → `CONFIG.presenca.frente`. Se a foto nova não tiver
esse contraste, remova o campo `frente` da cena em `data/cenas.ts`.

## Vídeo controlado pela rolagem

Cada plano (foto) toca um clipe quadro a quadro conforme a rolagem — rolar para baixo
avança, para cima volta, parar congela.

### Filme 2.5D (o que está no ar)

Cada foto vira um clipe com câmera em profundidade, **sem IA generativa**: nenhum pixel é
inventado. A foto é separada em objetos pelas bordas do mapa de profundidade (cada pessoa ou
grupo vira uma peça), e cada peça só é movida e escalada inteira — rosto e corpo nunca
deformam. O movimento de cada plano foi escrito para a frase da cena (ex.: CÉLULAS recua
quando "só aqui" é riscado; TREINAR sobe em grua em "crescer").

1. `npm run filme:profundidade` — mapas de profundidade (Depth Anything V2, roda local;
   só estima distância, não altera a foto) em `filme/profundidade/`.
2. `npm run filme:parallax` (ou `npm run filme:parallax hero cta`) — renderiza os quadros
   em `public/filme/<nome>/` e atualiza o manifest. A câmera de cada plano fica em
   `MOVIMENTOS`, no topo de `scripts/filme-parallax.mjs`.

Trocou uma foto? Rode os dois comandos para ela.

### Vídeo filmado de verdade (tem prioridade)

1. Coloque o clipe em `filme/clipes/` com o **nome da foto**: `hero.mp4`, `geracao.mp4`…
   (`video` no plano em `data/cenas.ts` aponta para outro nome; `cena-01.mp4` cobre a cena
   inteira.)
2. `FILME_FORMATO=webp FILME_MOBILE=1 npm run filme:quadros` — esse plano passa a usar o
   vídeo real; o 2.5D dele é ignorado.

⚠ Não use vídeo gerado por IA a partir das fotos: testado (Higgsfield / Minimax Hailuo),
ele muda rostos e corpos das pessoas.

O site só baixa os quadros das cenas próximas da posição atual (primeiro 1 a cada 8,
depois o resto) e, no celular, usa metade dos quadros.

## Arquitetura do motor

```
components/cinematic/
  motor.ts          timeline em vh, tipos das cenas, matemática (janela, pulso…)
  FilmeScroll.tsx   seção sticky 100dvh + ScrollTrigger → progresso → canvas + textos
  FilmeCanvas.tsx   "projetor": Ken Burns, quadros de vídeo, transições (dissolve,
                    corte, flash, blur, preto), feixes, vinheta, letterbox, glitch,
                    camada de frente
  contexto.tsx      barramento: as cenas se inscrevem e escrevem estilos direto no DOM
                    (sem re-render do React por quadro)
  Cena.tsx          seção fixada sem canvas (Números, Galeria)
  SmoothScroll.tsx  Lenis global sincronizado com o ScrollTrigger
  LightLeak / Grain / ScrollProgress
```

- Os textos são HTML de verdade (acessíveis e indexáveis); o canvas é decorativo.
- `prefers-reduced-motion`: sem filme, sem smooth scroll — cada cena vira uma seção
  estática com todo o conteúdo.
- Desempenho: o canvas só redesenha quando a rolagem muda; `devicePixelRatio` limitado
  (1,5 no celular, 2 no desktop, teto de ~3,8 MP); nada é desenhado fora da tela.
