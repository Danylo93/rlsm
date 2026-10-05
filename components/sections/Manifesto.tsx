'use client'

/**
 * CENA 10 — Manifesto. Tela preta. As palavras acendem uma a uma com a
 * rolagem (e apagam ao voltar). Pausa. Segunda frase. Assinatura.
 */

import { useRef } from 'react'
import { mostrar, mover, useCena, useModo, useOculto } from '@/components/cinematic/contexto'
import { janela, lerp } from '@/components/cinematic/motor'

const FRASE_A = [['Não', 'queremos'], ['assistir', 'uma'], ['geração', 'mudar.']]
const FRASE_B = [['Queremos'], ['ser', 'essa'], ['geração.']]

function Frase({
    linhas,
    palavrasRef,
    destaque,
    filme,
}: {
    linhas: string[][]
    palavrasRef: React.RefObject<Array<HTMLSpanElement | null>>
    destaque?: string
    filme: boolean
}) {
    let n = 0
    return (
        <p className="display text-[min(17vw,12.5dvh)] leading-[0.88] sm:text-[min(10.5vw,19dvh)]">
            {linhas.map((linha, i) => (
                <span key={i} className="block">
                    {linha.map((p) => {
                        const idx = n++
                        return (
                            <span
                                key={p + idx}
                                ref={(el) => {
                                    palavrasRef.current[idx] = el
                                }}
                                className={`mr-[0.22em] inline-block ${p === destaque ? 'text-acido' : ''}`}
                                style={filme ? { opacity: 0.1 } : undefined}
                            >
                                {p}
                            </span>
                        )
                    })}
                </span>
            ))}
        </p>
    )
}

export default function Manifesto() {
    const filme = useModo() === 'filme'
    const oculto = useOculto()
    const aRef = useRef<HTMLDivElement>(null)
    const bRef = useRef<HTMLDivElement>(null)
    const fimRef = useRef<HTMLDivElement>(null)
    const fimL1 = useRef<HTMLSpanElement>(null)
    const fimL2 = useRef<HTMLSpanElement>(null)
    const palavrasA = useRef<Array<HTMLSpanElement | null>>([])
    const palavrasB = useRef<Array<HTMLSpanElement | null>>([])

    const acender = (lista: Array<HTMLSpanElement | null>, t: number, ini: number, fim: number) => {
        const passo = (fim - ini) / lista.length
        lista.forEach((el, i) => {
            if (!el) return
            const k = janela(t, ini + i * passo, ini + (i + 1.4) * passo)
            el.style.opacity = lerp(0.1, 1, k).toFixed(3)
            el.style.transform = `translate3d(0, ${((1 - k) * 0.12).toFixed(3)}em, 0)`
        })
    }

    useCena('manifesto', (t) => {
        const saiA = janela(t, 0.36, 0.42)
        mostrar(aRef.current, janela(t, -0.05, 0.02) * (1 - saiA))
        mover(aRef.current, `translate3d(0, ${(-saiA * 6).toFixed(2)}dvh, 0)`)
        acender(palavrasA.current, t, 0.03, 0.3)

        // pausa visual: .42 → .48 tela vazia
        const saiB = janela(t, 0.74, 0.8)
        mostrar(bRef.current, janela(t, 0.46, 0.5) * (1 - saiB))
        mover(bRef.current, `translate3d(0, ${(-saiB * 6).toFixed(2)}dvh, 0)`)
        acender(palavrasB.current, t, 0.49, 0.68)

        const f = janela(t, 0.82, 0.92) * (1 - janela(t, 0.98, 1.06))
        mostrar(fimRef.current, f)
        mover(fimRef.current, `scale(${lerp(1.18, 1, janela(t, 0.82, 0.95)).toFixed(4)})`)
        const ls = lerp(0.12, -0.01, janela(t, 0.82, 0.95))
        if (fimL1.current) fimL1.current.style.letterSpacing = `${ls.toFixed(4)}em`
        if (fimL2.current) fimL2.current.style.letterSpacing = `${(ls + 0.4).toFixed(4)}em`
    })

    const caixa = filme
        ? 'absolute inset-0 flex flex-col justify-center px-4 pt-[var(--cabecalho)] sm:px-8 lg:px-16'
        : 'relative px-4 py-16 sm:px-8'

    return (
        <div className={filme ? 'absolute inset-0 z-30' : 'relative py-20'}>
            <h2 className="sr-only">Manifesto</h2>
            <div ref={aRef} style={oculto} className={caixa}>
                <Frase linhas={FRASE_A} palavrasRef={palavrasA} filme={filme} />
            </div>
            <div ref={bRef} style={oculto} className={`${caixa} sm:items-end sm:text-right`}>
                <Frase linhas={FRASE_B} palavrasRef={palavrasB} destaque="geração." filme={filme} />
            </div>
            <div
                ref={fimRef}
                data-anim
                style={oculto}
                className={filme ? 'absolute inset-0 flex flex-col items-center justify-center px-4 pt-[var(--cabecalho)] text-center' : 'relative py-16 text-center'}
            >
                <p className="display text-[min(12.5vw,20dvh)] leading-[0.84]">
                    <span ref={fimL1} className="block whitespace-nowrap">
                        Radicais Livres
                    </span>
                </p>
                <p className="wide mt-4 text-[clamp(14px,2vw,26px)] text-acido">
                    <span ref={fimL2} className="inline-block pl-[0.4em] tracking-[0.4em]">
                        São Miguel
                    </span>
                </p>
            </div>
        </div>
    )
}
