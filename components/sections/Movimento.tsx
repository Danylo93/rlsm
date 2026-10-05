'use client'

/**
 * CENA 06 — Movimento.
 * Montagem rápida (o canvas troca de plano com corte seco + micro-glitch) e
 * letras gigantes atravessando a tela na horizontal.
 */

import { useContext, useRef } from 'react'
import { ContextoFilme, mostrar, mover, useCena, useModo, useOculto } from '@/components/cinematic/contexto'
import { clamp, faixa, janela, limitesPlanos } from '@/components/cinematic/motor'
import { Kicker } from '@/components/ui/Tipo'

/** atravessa a tela devagar no meio e rápido nas pontas (dá tempo de ler) */
const travessia = (k: number) => 0.5 + 4 * Math.pow(k - 0.5, 3)

export default function Movimento() {
    const filme = useModo() === 'filme'
    const oculto = useOculto()
    const ctx = useContext(ContextoFilme)
    const cena = ctx?.cenas.find((c) => c.id === 'movimento')
    const planos = cena?.planos ?? []
    const limites = cena ? limitesPlanos(cena) : []

    const raizRef = useRef<HTMLDivElement>(null)
    const r1Ref = useRef<HTMLParagraphElement>(null)
    const r2Ref = useRef<HTMLParagraphElement>(null)
    const fantasmaRef = useRef<HTMLParagraphElement>(null)
    const rotuloRef = useRef<HTMLSpanElement>(null)
    const indiceRef = useRef<HTMLSpanElement>(null)
    const hudRef = useRef<HTMLDivElement>(null)
    const ultimo = useRef(-1)

    useCena('movimento', (t) => {
        mostrar(raizRef.current, (t > -0.2 ? 1 : 0) * (1 - janela(t, 0.9, 0.98)))
        const k1 = travessia(faixa(t, -0.06, 0.6))
        mover(r1Ref.current, `translate3d(calc(${(100 - 100 * k1).toFixed(2)}vw - ${(100 * k1).toFixed(2)}%), 0, 0)`)
        const k2 = travessia(faixa(t, 0.36, 0.95))
        mover(r2Ref.current, `translate3d(calc(${(-100 + 100 * k2).toFixed(2)}% + ${(100 * k2).toFixed(2)}vw), 0, 0)`)
        mover(fantasmaRef.current, `translate3d(${(-t * 60).toFixed(2)}vw, -50%, 0)`)
        if (fantasmaRef.current) fantasmaRef.current.style.opacity = (0.25 * janela(t, 0, 0.08)).toFixed(3)

        mostrar(hudRef.current, janela(t, 0, 0.04) * (1 - janela(t, 0.9, 0.98)))
        let k = limites.findIndex((l) => t < l)
        if (k < 0) k = planos.length - 1
        k = clamp(k, 0, planos.length - 1)
        if (k !== ultimo.current) {
            ultimo.current = k
            if (rotuloRef.current) rotuloRef.current.textContent = planos[k]?.rotulo ?? ''
            if (indiceRef.current)
                indiceRef.current.textContent = `${String(k + 1).padStart(2, '0')}/${String(planos.length).padStart(2, '0')}`
        }
    })

    if (!filme) {
        return (
            <div className="px-4 py-28 sm:px-8">
                <Kicker className="mb-6">06 — Movimento</Kicker>
                <h2 className="display text-[min(16vw,22dvh)] leading-[0.86]">
                    Não somos espectadores. <span className="text-acido">Fazemos parte.</span>
                </h2>
                <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {planos.map((p) => (
                        <li key={p.src} className="relative aspect-[4/5] overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.srcMobile ?? p.src} alt={p.rotulo ?? ''} loading="lazy" className="h-full w-full object-cover" />
                            <span className="wide absolute bottom-2 left-2 bg-preto px-2 py-1 text-[10px]">{p.rotulo}</span>
                        </li>
                    ))}
                </ul>
            </div>
        )
    }

    const enorme = 'display whitespace-nowrap text-[min(30dvh,30vw)] leading-[0.82] sm:text-[min(36dvh,24vw)]'

    return (
        <div ref={raizRef} style={oculto} className="absolute inset-0 z-30 overflow-hidden">
            <h2 className="sr-only">Não somos espectadores. Fazemos parte.</h2>

            {/* linha fantasma ao fundo, sentido contrário (profundidade) */}
            <p
                ref={fantasmaRef}
                aria-hidden
                className="display contorno absolute left-0 top-1/2 whitespace-nowrap text-[min(22dvh,20vw)] leading-none"
                style={{ opacity: 0 }}
            >
                Movimento ✦ Movimento ✦ Movimento ✦ Movimento ✦ Movimento
            </p>

            <p
                ref={r1Ref}
                aria-hidden
                data-anim
                className={`${enorme} sombra-filme absolute left-0 top-[13dvh] sm:top-[9dvh]`}
                style={{ transform: 'translate3d(100vw,0,0)' }}
            >
                Não somos espectadores.
            </p>
            <p
                ref={r2Ref}
                aria-hidden
                data-anim
                className={`${enorme} absolute bottom-[13dvh] left-0 text-acido sm:bottom-[10dvh]`}
                style={{ transform: 'translate3d(-100%,0,0)' }}
            >
                Fazemos parte.
            </p>

            {/* HUD da montagem */}
            <div ref={hudRef} style={oculto} className="absolute left-4 top-[calc(var(--cabecalho)+12px)] sm:left-8">
                <p className="mono flex items-center gap-3 text-[10px] sm:text-[11px]">
                    <span className="h-2 w-2 bg-brasa" aria-hidden />
                    <span ref={indiceRef} className="tabular-nums text-osso/60">
                        01/{String(planos.length).padStart(2, '0')}
                    </span>
                    <span ref={rotuloRef} className="wide text-[11px] tracking-[0.14em] sm:text-[12px]">
                        {planos[0]?.rotulo}
                    </span>
                </p>
            </div>
        </div>
    )
}
