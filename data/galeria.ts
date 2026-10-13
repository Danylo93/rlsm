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
    paisagem?: boolean
    m: { x: number; y: number; w: number }
}

const g = (n: string) => `/img/galeria/${n}.webp`

export const galeria: FotoGaleria[] = [
    { src: g('g-07'), alt: 'Jovens do RL São Miguel após o culto', x: -33, y: -22, w: 19, r: -6, camada: 'tras', entra: [0.02, 0.14], de: [-70, -10], fita: true, legenda: 'culto rl', m: { x: -26, y: -30, w: 34 } },
    { src: g('g-03'), alt: 'Jovens e líderes reunidos em um encontro', x: 30, y: -25, w: 17, r: 5, camada: 'tras', entra: [0.06, 0.18], de: [70, -20], legenda: 'depois do culto', m: { x: 22, y: -33, w: 32 } },
    { src: g('g-08'), alt: 'Três amigos reunidos em uma casa', x: -6, y: -31, w: 14, r: 3, camada: 'tras', entra: [0.1, 0.22], de: [0, -80], m: { x: 2, y: -38, w: 26 } },
    { src: g('g-02'), alt: 'Líder compartilhando uma mensagem', x: 35, y: 15, w: 20, r: -4, camada: 'frente', entra: [0.15, 0.27], de: [70, 20], fita: true, legenda: 'mensagem', m: { x: 26, y: 30, w: 36 } },
    { src: g('g-06'), alt: 'Família RL São Miguel em um evento', x: -35, y: 18, w: 17, r: 7, camada: 'frente', entra: [0.19, 0.31], de: [-30, 80], legenda: 'família', m: { x: -24, y: 32, w: 34 } },
    { src: g('g-13'), alt: 'Família RL São Miguel reunida no Holy Fest', paisagem: true, x: 9, y: 31, w: 15, r: -3, camada: 'tras', entra: [0.23, 0.35], de: [0, 80], m: { x: 0, y: 36, w: 28 } },
    { src: g('g-04'), alt: 'Três jovens sorrindo juntos na igreja', x: -19, y: 3, w: 13, r: -9, camada: 'frente', entra: [0.32, 0.44], de: [-80, 0], fita: true, m: { x: -34, y: -4, w: 26 } },
    { src: g('g-01'), alt: 'Família RL São Miguel reunida na igreja', x: 21, y: -3, w: 14, r: 8, camada: 'frente', entra: [0.38, 0.5], de: [80, 0], legenda: 'família', m: { x: 34, y: 6, w: 26 } },
    { src: g('g-14'), alt: 'Jovens e líderes juntos após o culto', paisagem: true, x: -44, y: -2, w: 12, r: 4, camada: 'tras', entra: [0.44, 0.56], de: [-60, 30], m: { x: -30, y: 16, w: 24 } },
    { src: g('g-15'), alt: 'Encontro dos jovens do RL São Miguel', paisagem: true, x: 44, y: -8, w: 12, r: -6, camada: 'tras', entra: [0.48, 0.6], de: [60, -30], m: { x: 30, y: -16, w: 24 } },
    { src: g('g-16'), alt: 'Comunidade RL São Miguel reunida na igreja', paisagem: true, x: 26, y: 32, w: 14, r: 4, camada: 'frente', entra: [0.54, 0.66], de: [40, 80], legenda: 'novo começo', m: { x: 18, y: 38, w: 28 } },
    { src: g('g-05'), alt: 'Grupo de jovens na igreja', x: -4, y: 27, w: 16, r: -2, camada: 'frente', entra: [0.66, 0.8], de: [0, 90], fita: true, legenda: 'isso é rl', m: { x: -16, y: 39, w: 30 } },
]
