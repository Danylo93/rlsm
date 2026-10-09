/**
 * Motor do filme — tipos e matemática compartilhados.
 *
 * Unidade da timeline: vh de rolagem. Cada cena ocupa `vh` de rolagem; a
 * transição de ENTRADA de uma cena acontece nos últimos `entrada.vh` da cena
 * anterior (as duas aparecem juntas). Com isso:
 *
 *   g        posição na timeline (vh rolados dentro do filme)
 *   t        progresso local da cena: (g - inicio) / vh   — NÃO é limitado,
 *            fica negativo durante a entrada e > 1 depois que ela acaba,
 *            para os textos poderem entrar antes e sair depois.
 */

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smooth = (t: number) => t * t * (3 - 2 * t)
/** 0→1 suavizado entre a e b */
export const janela = (p: number, a: number, b: number) => smooth(clamp((p - a) / (b - a)))
/** 0→1 linear entre a e b */
export const faixa = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
/** sobe em [a,b], mantém, desce em [c,d] */
export const pulso = (p: number, a: number, b: number, c: number, d: number) =>
    janela(p, a, b) * (1 - janela(p, c, d))
export const expoOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))

export type Transicao =
    | 'dissolve' // cross dissolve
    | 'corte' // corte seco com flash curto
    | 'flash' // dissolve com estouro de exposição
    | 'blur' // dissolve com desfoque
    | 'preto' // mergulho no preto

export interface Camera {
    /** Preserva a foto inteira quando o retrato aparece em telas largas. */
    enquadramento?: 'cobrir' | 'conter'
    /** zoom inicial/final (1 = cobre a tela) */
    z0: number
    z1: number
    /** pan -1..1 (proporção da sobra da imagem) */
    px0: number
    px1: number
    py0: number
    py1: number
    /** rotação em graus (bem sutil) */
    r0?: number
    r1?: number
}

export interface Plano {
    /** foto paisagem (desktop) */
    src: string
    /** recorte retrato (telas em pé) */
    srcMobile?: string
    /** até onde (0..1 da cena) este plano fica na tela */
    ate?: number
    camera?: Partial<Camera>
    cameraMobile?: Partial<Camera>
    /** camada de primeiro plano (pessoas recortadas) desenhada por cima do texto */
    frente?: { src: string; srcMobile?: string }
    /** legenda do plano (montagens) */
    rotulo?: string
    alt?: string
}

export interface Luz {
    /** feixe volumétrico: x (0..1), ângulo (rad), alfa */
    feixe?: { x: number; angulo: number; alfa: number; deriva?: number }
    /** tom quente (0..1) */
    quente?: number
    /** exposição início→fim (-1 escurece, +1 estoura) */
    exposicao?: [number, number]
    /** vazamento de luz (light leak) 0..1 */
    vazamento?: number
}

export interface CenaFilme {
    id: string
    /** número da cena (casa com o `cena` do manifest de quadros) */
    numero: number
    /** nome do capítulo (trilho lateral e versão estática) */
    capitulo: string
    /** comprimento em vh de rolagem */
    vh: number
    entrada?: { tipo: Transicao; vh: number }
    /** sem planos = tela preta (ex.: manifesto) */
    planos: Plano[]
    camera?: Partial<Camera>
    cameraMobile?: Partial<Camera>
    /** transição entre planos da mesma cena */
    corteInterno?: Transicao
    /** cortes da montagem com micro-glitch editorial */
    glitch?: boolean
    luz?: Luz
    /** escurecimento extra para legibilidade (0..1) */
    escurecer?: number
    /** faixas pretas de cinema (0..1) */
    letterbox?: number
    /** a cena termina mergulhando no preto (fim do filme) */
    saidaPreto?: boolean
    /** âncora de navegação (#id) e em que ponto da cena ela cai (0..1) */
    ancora?: string
    ancoraEm?: number
}

export interface EstadoFilme {
    /** progresso do filme 0..1 */
    p: number
    /** posição em vh */
    g: number
    /** índice da cena dominante */
    atual: number
    /** progresso local de cada cena (ver topo do arquivo) */
    t: number[]
    /** 1 descendo, -1 subindo */
    direcao: 1 | -1
}

export interface Linha {
    inicio: number[]
    total: number
}

export function montarLinha(cenas: CenaFilme[]): Linha {
    const inicio: number[] = []
    let acc = 0
    for (const c of cenas) {
        inicio.push(acc)
        acc += c.vh
    }
    return { inicio, total: acc }
}

export function calcularEstado(
    cenas: CenaFilme[],
    linha: Linha,
    p: number,
    direcao: 1 | -1
): EstadoFilme {
    const g = clamp(p) * linha.total
    let atual = 0
    for (let i = 0; i < cenas.length; i++) if (g >= linha.inicio[i]) atual = i
    const t = cenas.map((c, i) => (g - linha.inicio[i]) / c.vh)
    return { p, g, atual, t, direcao }
}

/** pontos de corte dos planos de uma cena (0..1). */
export function limitesPlanos(cena: CenaFilme): number[] {
    const n = cena.planos.length
    return cena.planos.map((pl, k) => pl.ate ?? (k + 1) / n)
}

export const CAMERA_PADRAO: Camera = { z0: 1.04, z1: 1.01, px0: 0, px1: 0, py0: 0, py1: 0, r0: 0, r1: 0 }
