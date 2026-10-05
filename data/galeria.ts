/**
 * Galeria — "photo wall" montado pela rolagem.
 *
 * Posições relativas ao centro da tela: x em vw, y em vh, w (largura) em vw.
 * `entra`: janela da rolagem (0..1) em que a foto chega ao lugar.
 * `de`: de onde ela vem (deslocamento em vw/vh).
 * `camada`: 'tras' fica atrás do texto ISSO É FAMÍLIA, 'frente' passa na frente.
 * `m`: posição alternativa no celular — fotos em faixas em cima/embaixo e nas
 *      laterais, deixando o centro livre para a frase.
 *
 * Para trocar uma foto: substitua fotos-originais/g-XX.jpg e rode `npm run fotos`.
 */

export interface FotoGaleria {
    src: string
    alt: string
    x: number
    y: number
    w: number
    r: number
    camada: 'tras' | 'frente'
    entra: [number, number]
    de: [number, number]
    /** fita adesiva (imperfeição proposital) */
    fita?: boolean
    legenda?: string
    m: { x: number; y: number; w: number }
}

const g = (n: string) => `/img/galeria/${n}.webp`

export const galeria: FotoGaleria[] = [
    { src: g('g-07'), alt: 'Jovens conversando no culto', x: -33, y: -22, w: 19, r: -6, camada: 'tras', entra: [0.02, 0.14], de: [-70, -10], fita: true, legenda: 'culto rl', m: { x: -26, y: -30, w: 34 } },
    { src: g('g-03'), alt: 'Amigos rindo juntos', x: 30, y: -25, w: 17, r: 5, camada: 'tras', entra: [0.06, 0.18], de: [70, -20], legenda: 'depois do culto', m: { x: 22, y: -33, w: 32 } },
    { src: g('g-08'), alt: 'Jovem adorando de braços abertos', x: -6, y: -31, w: 14, r: 3, camada: 'tras', entra: [0.1, 0.22], de: [0, -80], m: { x: 2, y: -38, w: 26 } },
    { src: g('g-02'), alt: 'Batismo na piscina com alegria', x: 35, y: 15, w: 20, r: -4, camada: 'frente', entra: [0.15, 0.27], de: [70, 20], fita: true, legenda: 'batismo', m: { x: 26, y: 30, w: 36 } },
    { src: g('g-06'), alt: 'Abraço em grupo', x: -35, y: 18, w: 17, r: 7, camada: 'frente', entra: [0.19, 0.31], de: [-30, 80], legenda: 'família', m: { x: -24, y: 32, w: 34 } },
    { src: g('g-12'), alt: 'Roda de oração', x: 9, y: 31, w: 15, r: -3, camada: 'tras', entra: [0.23, 0.35], de: [0, 80], m: { x: 0, y: 36, w: 28 } },
    { src: g('g-04'), alt: 'Três amigos sorrindo ao ar livre', x: -19, y: 3, w: 13, r: -9, camada: 'frente', entra: [0.32, 0.44], de: [-80, 0], fita: true, m: { x: -34, y: -4, w: 26 } },
    { src: g('g-01'), alt: 'Abraço no meio do louvor', x: 21, y: -3, w: 14, r: 8, camada: 'frente', entra: [0.38, 0.5], de: [80, 0], legenda: 'presença', m: { x: 34, y: 6, w: 26 } },
    { src: g('g-10'), alt: 'Amigos rindo no parque', x: -44, y: -2, w: 12, r: 4, camada: 'tras', entra: [0.44, 0.56], de: [-60, 30], m: { x: -30, y: 16, w: 24 } },
    { src: g('g-09'), alt: 'Amigos de moletom', x: 44, y: -8, w: 12, r: -6, camada: 'tras', entra: [0.48, 0.6], de: [60, -30], m: { x: 30, y: -16, w: 24 } },
    { src: g('g-11'), alt: 'Batismo no mar', x: 26, y: 32, w: 14, r: 4, camada: 'frente', entra: [0.54, 0.66], de: [40, 80], legenda: 'novo começo', m: { x: 18, y: 38, w: 28 } },
    { src: g('g-05'), alt: 'Amigos olhando o celular e rindo', x: -4, y: 27, w: 16, r: -2, camada: 'frente', entra: [0.66, 0.8], de: [0, 90], fita: true, legenda: 'isso é rl', m: { x: -16, y: 39, w: 30 } },
]
