'use client'

/**
 * FilmeCanvas — o "projetor".
 *
 * Desenha a cena da posição atual da timeline num canvas fullscreen. Não tem
 * relógio próprio: só redesenha quando o motor pede (rolagem, imagem nova,
 * resize). Parou de rolar → o filme para naquele quadro. Subiu → volta.
 *
 * Fontes de imagem, por prioridade:
 *  1. Sequência de quadros de vídeo (public/filme/manifest.json): o progresso
 *     da cena vira índice de quadro → vídeo reversível pela rolagem.
 *  2. Fotos dos planos, com câmera Ken Burns (zoom, pan, rotação sutil).
 *
 * Também desenha uma segunda camada ("frente") com pessoas recortadas, que
 * fica ACIMA do texto HTML — é assim que PRESENÇA passa por trás das pessoas.
 */

import { useEffect, useRef, type RefObject } from 'react'
import {
    CAMERA_PADRAO,
    clamp,
    faixa,
    janela,
    lerp,
    limitesPlanos,
    smooth,
    type Camera,
    type CenaFilme,
    type EstadoFilme,
    type Linha,
    type Luz,
    type Transicao,
} from './motor'

export interface FilmeCanvasApi {
    desenhar: (e: EstadoFilme) => void
}

interface Props {
    cenas: CenaFilme[]
    linha: Linha
    apiRef: RefObject<FilmeCanvasApi | null>
    /** algo mudou (imagem chegou, tela mudou): o motor deve redesenhar */
    aoSujar: () => void
    /** primeira imagem pronta */
    aoPronto: () => void
    /** canvas visível (antes disso aparece o pôster) */
    pronto: boolean
}

interface Manifesto {
    formato?: 'jpg' | 'webp'
    cenas: Array<{ cena: number; pasta: string; quadros: number; mobile?: boolean }>
}

interface Entrada {
    img: HTMLImageElement
    src: string
    pronta: boolean
    pedida: boolean
    falhou: boolean
    cena: number
    peso: number
}

const PRETO = '#080808'
const MAX_SIMULTANEAS = 5
const MAX_PIXELS = 3_800_000

/** número pseudoaleatório estável (o glitch é igual indo e voltando) */
function aleatorio(semente: number) {
    const x = Math.sin(semente * 12.9898 + 78.233) * 43758.5453
    return x - Math.floor(x)
}

export default function FilmeCanvas({ cenas, linha, apiRef, aoSujar, aoPronto, pronto }: Props) {
    const baseRef = useRef<HTMLCanvasElement>(null)
    const frenteRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const base = baseRef.current!
        const frente = frenteRef.current!
        const ctx = base.getContext('2d', { alpha: false })!
        const fctx = frente.getContext('2d')!
        const suportaFiltro = 'filter' in CanvasRenderingContext2D.prototype

        let largura = 0
        let altura = 0
        let dpr = 1
        let retrato = false
        let leve = false
        let atual = 0
        let frenteSuja = false
        let destruido = false
        let avisouPronto = false

        /* ---------------- carregamento com prioridade ---------------- */

        const cache = new Map<string, Entrada>()
        let ativas = 0

        function pedir(src: string, cena: number, peso = 0): Entrada {
            let en = cache.get(src)
            if (!en) {
                const img = new Image()
                img.decoding = 'async'
                en = { img, src, pronta: false, pedida: false, falhou: false, cena, peso }
                cache.set(src, en)
                bombear()
            }
            return en
        }

        function bombear() {
            while (ativas < MAX_SIMULTANEAS) {
                let melhor: Entrada | null = null
                let nota = Infinity
                for (const en of cache.values()) {
                    if (en.pedida) continue
                    const n = Math.abs(en.cena - atual) * 10 + (en.cena < atual ? 4 : 0) + en.peso
                    if (n < nota) {
                        nota = n
                        melhor = en
                    }
                }
                if (!melhor) return
                const en = melhor
                en.pedida = true
                ativas++
                en.img.onload = () => {
                    const fim = () => {
                        ativas--
                        if (destruido) return
                        en.pronta = true
                        if (!avisouPronto) {
                            avisouPronto = true
                            aoPronto()
                        }
                        aoSujar()
                        bombear()
                    }
                    // decode fora da thread principal antes do primeiro desenho
                    if (en.img.decode) en.img.decode().then(fim, fim)
                    else fim()
                }
                en.img.onerror = () => {
                    ativas--
                    en.falhou = true
                    bombear()
                }
                en.img.src = en.src
            }
        }

        const fonte = (p: { src: string; srcMobile?: string }) => (retrato && p.srcMobile ? p.srcMobile : p.src)

        /** fotos de todas as cenas, na ordem do filme (são poucas e leves) */
        function pedirFotos() {
            cenas.forEach((c, i) =>
                c.planos.forEach((pl, k) => {
                    pedir(fonte(pl), i, k * 0.5)
                    if (pl.frente) pedir(fonte(pl.frente), i, k * 0.5 + 0.2)
                })
            )
        }

        /* ---------------- quadros de vídeo (manifest) ---------------- */

        const quadros: Array<string[] | null> = cenas.map(() => null)
        const quadrosPedidos = new Set<number>()
        let manifesto: Manifesto | null = null

        function montarQuadros() {
            if (!manifesto) return
            const ext = manifesto.formato ?? 'jpg'
            const passo = leve ? 2 : 1
            for (const m of manifesto.cenas) {
                const i = cenas.findIndex((c) => c.numero === Number(m.cena))
                if (i < 0 || !m.quadros) continue
                const pasta = retrato && m.mobile ? `${m.pasta}/m` : m.pasta
                const lista: string[] = []
                for (let q = 1; q <= m.quadros; q += passo) lista.push(`${pasta}/q-${String(q).padStart(3, '0')}.${ext}`)
                quadros[i] = lista
            }
            quadrosPedidos.clear()
        }

        /** só baixa os quadros das cenas perto da atual (preload inteligente) */
        function garantirQuadros() {
            for (let i = Math.max(0, atual - 1); i <= Math.min(cenas.length - 1, atual + 2); i++) {
                const lista = quadros[i]
                if (!lista || quadrosPedidos.has(i)) continue
                quadrosPedidos.add(i)
                // primeiro um quadro a cada 8 (a cena "existe" logo), depois o resto
                lista.forEach((src, q) => pedir(src, i, 1 + (q % 8 === 0 ? 0 : 1) + q / lista.length))
            }
        }

        fetch('/filme/manifest.json')
            .then((r) => (r.ok ? r.json() : null))
            .then((m: Manifesto | null) => {
                if (!m || destruido || !Array.isArray(m.cenas)) return
                manifesto = m
                montarQuadros()
                garantirQuadros()
                aoSujar()
            })
            .catch(() => {
                /* sem manifesto → fotos + Ken Burns */
            })

        /* ---------------- tamanho ---------------- */

        function redimensionar() {
            const w = base.clientWidth
            const h = base.clientHeight
            if (!w || !h) return
            const eraRetrato = retrato
            largura = w
            altura = h
            leve = w < 768
            retrato = w / h < 0.85
            dpr = Math.min(window.devicePixelRatio || 1, leve ? 1.5 : 2)
            if (w * h * dpr * dpr > MAX_PIXELS) dpr = Math.sqrt(MAX_PIXELS / (w * h))
            for (const cv of [base, frente]) {
                cv.width = Math.round(w * dpr)
                cv.height = Math.round(h * dpr)
            }
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            fctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            if (eraRetrato !== retrato || cache.size === 0) {
                pedirFotos()
                montarQuadros()
            }
            aoSujar()
        }
        redimensionar()
        // no iPhone a caixa (100dvh) muda quando a barra do Safari recolhe,
        // sem resize de janela: observar a caixa evita a cena esticada
        const observador = new ResizeObserver(redimensionar)
        observador.observe(base)

        /* ---------------- desenho ---------------- */

        function cobrir(c: CanvasRenderingContext2D, img: HTMLImageElement, cam: Camera, u: number, alfa: number) {
            const e = lerp(u, smooth(u), 0.6)
            const zoom = lerp(cam.z0, cam.z1, e)
            const px = lerp(cam.px0, cam.px1, e)
            const py = lerp(cam.py0, cam.py1, e)
            const rot = (lerp(cam.r0 ?? 0, cam.r1 ?? 0, e) * Math.PI) / 180
            const ir = img.naturalWidth / img.naturalHeight
            let dw: number, dh: number
            if (ir > largura / altura) {
                dh = altura
                dw = altura * ir
            } else {
                dw = largura
                dh = largura / ir
            }
            dw *= zoom
            dh *= zoom
            const ox = (px * (dw - largura)) / 2
            const oy = (py * (dh - altura)) / 2
            c.save()
            c.globalAlpha = alfa
            c.translate(largura / 2 + ox, altura / 2 + oy)
            if (rot) c.rotate(rot)
            c.drawImage(img, -dw / 2, -dh / 2, dw, dh)
            c.restore()
        }

        function cameraDe(cena: CenaFilme, k: number): Camera {
            const pl = cena.planos[k]
            return retrato
                ? { ...CAMERA_PADRAO, ...cena.camera, ...cena.cameraMobile, ...pl?.camera, ...pl?.cameraMobile }
                : { ...CAMERA_PADRAO, ...cena.camera, ...pl?.camera }
        }

        /** imagem pronta para um plano (cai para a outra orientação se preciso) */
        function imagemPronta(p: { src: string; srcMobile?: string }, i: number): HTMLImageElement | null {
            const en = pedir(fonte(p), i)
            if (en.pronta) return en.img
            const outra = cache.get(retrato ? p.src : (p.srcMobile ?? p.src))
            return outra?.pronta ? outra.img : null
        }

        function quadroPronto(i: number, u: number): HTMLImageElement | null {
            const lista = quadros[i]
            if (!lista) return null
            const n = lista.length
            const idx = Math.min(n - 1, Math.floor(u * n))
            // quadro exato ou o vizinho mais perto já carregado
            for (let d = 0; d < 10; d++) {
                for (const j of d === 0 ? [idx] : [idx - d, idx + d]) {
                    if (j < 0 || j >= n) continue
                    const en = cache.get(lista[j])
                    if (en?.pronta) return en.img
                }
            }
            return null
        }

        interface Resultado {
            flash: number
            glitch: number
            semente: number
            u: number
        }

        function desenharCena(i: number, e: EstadoFilme, alfa: number, blur: number): Resultado {
            const cena = cenas[i]
            const ent = cena.entrada?.vh ?? 0
            const ini = linha.inicio[i]
            const u = clamp((e.g - (ini - ent)) / (cena.vh + ent))
            const tl = e.t[i]
            const r: Resultado = { flash: 0, glitch: 0, semente: i, u }

            if (blur > 0.4 && suportaFiltro && !leve) ctx.filter = `blur(${blur.toFixed(1)}px)`

            // 1. sequência de quadros (vídeo controlado pela rolagem)
            const q = quadroPronto(i, u)
            if (q) {
                cobrir(ctx, q, { ...CAMERA_PADRAO, z0: 1.02, z1: 1.07 }, u, alfa)
                ctx.filter = 'none'
                return r
            }

            // 2. planos com Ken Burns
            const n = cena.planos.length
            if (!n) {
                ctx.filter = 'none'
                return r
            }
            const lim = limitesPlanos(cena)
            let k = lim.findIndex((l) => tl < l)
            if (k < 0) k = n - 1
            const iniK = k === 0 ? -ent / cena.vh : lim[k - 1]
            const uk = clamp((tl - iniK) / (lim[k] - iniK))
            const pl = cena.planos[k]
            const img = imagemPronta(pl, i)
            if (img) cobrir(ctx, img, cameraDe(cena, k), uk, alfa)

            // transição interna entre planos
            const tipo: Transicao = cena.corteInterno ?? 'dissolve'
            if (k < n - 1 && (tipo === 'dissolve' || tipo === 'blur' || tipo === 'flash')) {
                const d = 0.045
                if (tl > lim[k] - d) {
                    const m = smooth(faixa(tl, lim[k] - d, lim[k]))
                    const prox = imagemPronta(cena.planos[k + 1], i)
                    if (prox) cobrir(ctx, prox, cameraDe(cena, k + 1), 0, alfa * m)
                    if (tipo === 'flash') r.flash += Math.sin(Math.PI * m) * 0.35
                }
            }
            if (k > 0 && (tipo === 'corte' || tipo === 'flash')) {
                const desde = tl - lim[k - 1]
                r.flash += (1 - faixa(desde, 0, 0.025)) * (tipo === 'corte' ? 0.32 : 0)
                if (cena.glitch) r.glitch = 1 - faixa(desde, 0, 0.018)
                r.semente = i * 97 + k
            }

            // camada de frente (pessoas por cima do texto)
            if (pl.frente) {
                const en = pedir(fonte(pl.frente), i)
                if (en.pronta) {
                    cobrir(fctx, en.img, cameraDe(cena, k), uk, alfa)
                    frenteSuja = true
                }
            }

            ctx.filter = 'none'
            return r
        }

        function feixe(x: number, angulo: number, alfa: number) {
            if (alfa <= 0.002) return
            ctx.save()
            ctx.globalCompositeOperation = 'screen'
            ctx.translate(largura * x, -altura * 0.12)
            ctx.rotate(angulo)
            const g = ctx.createLinearGradient(0, 0, 0, altura * 1.5)
            g.addColorStop(0, `rgba(255, 214, 150, ${alfa})`)
            g.addColorStop(0.55, `rgba(255, 190, 120, ${alfa * 0.32})`)
            g.addColorStop(1, 'rgba(255, 190, 120, 0)')
            ctx.fillStyle = g
            const larg = largura * (leve ? 0.42 : 0.26)
            ctx.beginPath()
            ctx.moveTo(-larg * 0.12, 0)
            ctx.lineTo(larg * 0.12, 0)
            ctx.lineTo(larg * 0.5, altura * 1.5)
            ctx.lineTo(-larg * 0.5, altura * 1.5)
            ctx.closePath()
            ctx.fill()
            ctx.restore()
        }

        /** vinheta + degradês de leitura (também aplicados à camada de frente) */
        function grade(c: CanvasRenderingContext2D, escurecer: number, exposicao: number, atop: boolean) {
            c.save()
            if (atop) c.globalCompositeOperation = 'source-atop'
            if (exposicao < 0) {
                c.fillStyle = `rgba(8,8,8,${(-exposicao * 0.55).toFixed(3)})`
                c.fillRect(0, 0, largura, altura)
            }
            if (escurecer > 0) {
                c.fillStyle = `rgba(8,8,8,${(escurecer * 0.55).toFixed(3)})`
                c.fillRect(0, 0, largura, altura)
            }
            const v = c.createRadialGradient(
                largura / 2,
                altura * 0.46,
                Math.min(largura, altura) * 0.32,
                largura / 2,
                altura / 2,
                Math.hypot(largura, altura) * 0.62
            )
            v.addColorStop(0, 'rgba(8,8,8,0)')
            v.addColorStop(1, 'rgba(8,8,8,0.7)')
            c.fillStyle = v
            c.fillRect(0, 0, largura, altura)
            const b = c.createLinearGradient(0, altura, 0, altura * 0.42)
            b.addColorStop(0, 'rgba(8,8,8,0.78)')
            b.addColorStop(1, 'rgba(8,8,8,0)')
            c.fillStyle = b
            c.fillRect(0, altura * 0.42, largura, altura * 0.58)
            const t = c.createLinearGradient(0, 0, 0, altura * 0.22)
            t.addColorStop(0, 'rgba(8,8,8,0.5)')
            t.addColorStop(1, 'rgba(8,8,8,0)')
            c.fillStyle = t
            c.fillRect(0, 0, largura, altura * 0.22)
            c.restore()
        }

        function glitch(intensidade: number, semente: number) {
            if (intensidade <= 0.02) return
            ctx.save()
            ctx.setTransform(1, 0, 0, 1, 0, 0)
            const W = base.width
            const H = base.height
            for (let s = 0; s < 5; s++) {
                const y = aleatorio(semente + s) * H
                const h = (0.015 + aleatorio(semente + s + 9) * 0.07) * H
                const dx = (aleatorio(semente + s + 21) - 0.5) * 0.08 * W * intensidade
                ctx.drawImage(base, 0, y, W, h, dx, y, W, h)
            }
            // fio ácido do corte editorial
            ctx.globalAlpha = 0.85 * intensidade
            ctx.fillStyle = '#d7ff1f'
            const yl = aleatorio(semente + 77) * H
            ctx.fillRect(aleatorio(semente + 5) * W * 0.4, yl, W * (0.2 + aleatorio(semente + 6) * 0.5), Math.max(2, 2 * dpr))
            ctx.restore()
        }

        function luzMisturada(a: Luz | undefined, b: Luz | undefined, k: number) {
            const val = (fn: (l: Luz | undefined) => number) => lerp(fn(a), fn(b), k)
            return {
                quente: val((l) => l?.quente ?? 0.3),
                vazamento: val((l) => l?.vazamento ?? 0),
            }
        }

        function desenhar(e: EstadoFilme) {
            if (!largura || !altura) return
            if (e.atual !== atual) {
                atual = e.atual
                garantirQuadros()
                bombear()
            }

            ctx.globalCompositeOperation = 'source-over'
            ctx.globalAlpha = 1
            ctx.fillStyle = PRETO
            ctx.fillRect(0, 0, largura, altura)
            if (frenteSuja) {
                fctx.clearRect(0, 0, largura, altura)
                frenteSuja = false
            }

            // transição de entrada em andamento?
            let trans: { i: number; tipo: Transicao; k: number } | null = null
            for (let i = 1; i < cenas.length; i++) {
                const ent = cenas[i].entrada
                if (!ent?.vh) continue
                const ini = linha.inicio[i]
                if (e.g >= ini - ent.vh && e.g < ini) {
                    trans = { i, tipo: ent.tipo, k: (e.g - (ini - ent.vh)) / ent.vh }
                    break
                }
            }
            const blur = trans?.tipo === 'blur' ? Math.sin(Math.PI * trans.k) * 16 : 0

            let flash = 0
            let glitchV = 0
            let semente = 0
            let principal = e.atual
            let uPrincipal = 0

            for (let i = 0; i < cenas.length; i++) {
                const c = cenas[i]
                const ini = linha.inicio[i]
                const ent = c.entrada?.vh ?? 0
                if (e.g < ini - ent || e.g > ini + c.vh + 0.001) continue
                let alfa = 1
                if (trans && trans.i === i) {
                    const k = trans.k
                    switch (trans.tipo) {
                        case 'corte':
                            alfa = k >= 0.5 ? 1 : 0
                            if (k >= 0.5) flash += 0.55 * (1 - faixa(k, 0.5, 0.75))
                            break
                        case 'preto':
                            // a cena que sai afunda no preto, a que entra sobe dele
                            ctx.fillStyle = `rgba(8,8,8,${janela(k, 0, 0.5).toFixed(3)})`
                            ctx.fillRect(0, 0, largura, altura)
                            alfa = janela(k, 0.5, 1)
                            break
                        case 'flash':
                            alfa = smooth(k)
                            flash += Math.sin(Math.PI * k) * 0.6
                            break
                        default:
                            alfa = smooth(k)
                    }
                }
                if (alfa <= 0.001) continue
                const r = desenharCena(i, e, alfa, blur)
                flash += r.flash
                if (r.glitch > glitchV) {
                    glitchV = r.glitch
                    semente = r.semente
                }
                if (alfa >= 0.5) {
                    principal = i
                    uPrincipal = r.u
                }
            }

            const cena = cenas[principal]
            const kLuz = trans ? smooth(trans.k) : 0
            const luz = trans
                ? luzMisturada(cenas[trans.i - 1].luz, cenas[trans.i].luz, kLuz)
                : luzMisturada(cena.luz, cena.luz, 0)

            // tom quente nos realces
            if (luz.quente > 0) {
                ctx.save()
                ctx.globalCompositeOperation = 'soft-light'
                ctx.fillStyle = `rgba(255, 150, 70, ${(luz.quente * 0.28).toFixed(3)})`
                ctx.fillRect(0, 0, largura, altura)
                ctx.restore()
            }

            // feixe volumétrico (bem sutil)
            const fx = cena.luz?.feixe
            if (fx) feixe(fx.x + (fx.deriva ?? 0.08) * (uPrincipal - 0.5), fx.angulo, fx.alfa * (trans ? 1 - Math.sin(Math.PI * trans.k) * 0.6 : 1))

            // exposição da cena (pode subir ou descer ao longo dela)
            const [ex0, ex1] = cena.luz?.exposicao ?? [0, 0]
            const exposicao = lerp(ex0, ex1, uPrincipal)
            if (exposicao > 0) {
                ctx.save()
                ctx.globalCompositeOperation = 'screen'
                ctx.fillStyle = `rgba(255,240,225,${(exposicao * 0.28).toFixed(3)})`
                ctx.fillRect(0, 0, largura, altura)
                ctx.restore()
            }

            glitch(glitchV, semente)

            const escurecer = cena.escurecer ?? 0
            grade(ctx, escurecer, exposicao, false)
            if (frenteSuja) grade(fctx, escurecer, exposicao, true)

            // flash de corte / estouro
            if (flash > 0.01) {
                ctx.save()
                ctx.globalCompositeOperation = 'screen'
                ctx.fillStyle = `rgba(255,248,236,${Math.min(0.9, flash).toFixed(3)})`
                ctx.fillRect(0, 0, largura, altura)
                ctx.restore()
            }

            // faixas de cinema
            const lb = cena.letterbox ?? 0
            if (lb > 0) {
                const visivel = trans ? (trans.i === principal ? smooth(trans.k) : 1 - smooth(trans.k)) : 1
                const h = altura * 0.09 * lb * visivel
                ctx.fillStyle = PRETO
                ctx.fillRect(0, 0, largura, h)
                ctx.fillRect(0, altura - h, largura, h)
                if (frenteSuja) {
                    fctx.clearRect(0, 0, largura, h)
                    fctx.clearRect(0, altura - h, largura, h)
                }
            }

            // fim do filme: mergulho no preto
            if (cena.saidaPreto) {
                const a = janela(e.t[principal], 0.8, 1)
                if (a > 0) {
                    ctx.fillStyle = `rgba(12,12,12,${a.toFixed(3)})`
                    ctx.fillRect(0, 0, largura, altura)
                    if (frenteSuja) {
                        fctx.save()
                        fctx.globalCompositeOperation = 'destination-out'
                        fctx.fillStyle = `rgba(0,0,0,${a.toFixed(3)})`
                        fctx.fillRect(0, 0, largura, altura)
                        fctx.restore()
                    }
                }
            }
        }

        apiRef.current = { desenhar }

        // se nada carregar (rede ruim), mostra o canvas mesmo assim
        const reserva = window.setTimeout(() => {
            if (!avisouPronto) {
                avisouPronto = true
                aoPronto()
            }
        }, 3500)

        return () => {
            destruido = true
            window.clearTimeout(reserva)
            observador.disconnect()
            apiRef.current = null
            for (const en of cache.values()) {
                en.img.onload = null
                en.img.onerror = null
            }
        }
        // o motor recria o componente se as cenas mudarem
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <canvas
                ref={baseRef}
                aria-hidden
                className={`absolute inset-0 z-0 h-full w-full transition-opacity duration-1000 ${pronto ? 'opacity-100' : 'opacity-0'}`}
            />
            {/* camada de frente: acima dos textos "de trás" (z-10), abaixo dos demais (z-30) */}
            <canvas
                ref={frenteRef}
                aria-hidden
                className={`pointer-events-none absolute inset-0 z-20 h-full w-full transition-opacity duration-1000 ${pronto ? 'opacity-100' : 'opacity-0'}`}
            />
        </>
    )
}
