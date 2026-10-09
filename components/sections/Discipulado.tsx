'use client'

/**
 * CENA 05 — Discipulado.
 * "Ninguém caminha sozinho." e depois CUIDAR → TREINAR → ENVIAR, uma palavra
 * por vez ocupando a tela, cada uma com seu plano de fundo.
 */

import { useRef } from 'react'
import { mostrar, mover, useCena, useModo, useOculto } from '@/components/cinematic/contexto'
import { faixa, janela, lerp } from '@/components/cinematic/motor'
import { Kicker } from '@/components/ui/Tipo'

const PALAVRAS = [
    { palavra: 'Cuidar', texto: 'Ninguém fica pra trás. A gente se conhece pelo nome.', janela: [0.34, 0.54] },
    { palavra: 'Treinar', texto: 'Crescer na Palavra, no caráter e no chamado.', janela: [0.54, 0.74] },
    { palavra: 'Enviar', texto: 'Levar Jesus pra escola, pro trampo, pra rua, pra casa.', janela: [0.74, 0.97] },
] as const

export default function Discipulado() {
    const filme = useModo() === 'filme'
    const oculto = useOculto()
    const fase1Ref = useRef<HTMLDivElement>(null)
    const linhasRef = useRef<Array<HTMLSpanElement | null>>([])
    const subRef = useRef<HTMLParagraphElement>(null)
    const palavrasRef = useRef<Array<HTMLDivElement | null>>([])
    const letrasRef = useRef<Array<HTMLSpanElement | null>>([])
    const barraRef = useRef<HTMLDivElement>(null)
    const segRef = useRef<Array<HTMLSpanElement | null>>([])

    useCena('discipulado', (t) => {
        const saida1 = janela(t, 0.27, 0.33)
        mostrar(fase1Ref.current, janela(t, -0.12, -0.07) * (1 - saida1))
        mover(fase1Ref.current, `translate3d(0, ${(-saida1 * 40).toFixed(1)}px, 0)`)
        linhasRef.current.forEach((el, i) => {
            const k = janela(t, -0.1 + i * 0.03, 0.03 + i * 0.03)
            mover(el, `translate3d(${((1 - k) * -14).toFixed(2)}vw, ${((1 - k) * 140).toFixed(1)}%, 0)`)
        })
        const s = janela(t, 0.08, 0.17)
        mostrar(subRef.current, s)
        mover(subRef.current, `translate3d(0, ${((1 - s) * 20).toFixed(1)}px, 0)`)

        PALAVRAS.forEach((p, i) => {
            const [a, b] = p.janela
            const ent = janela(t, a, a + 0.05)
            const sai = i === PALAVRAS.length - 1 ? janela(t, 1, 1.08) : janela(t, b - 0.035, b + 0.015)
            const el = palavrasRef.current[i]
            mostrar(el, ent * (1 - sai))
            mover(el, `scale(${(lerp(1.16, 1, ent) * lerp(1, 0.9, sai)).toFixed(4)})`)
            const l = letrasRef.current[i]
            if (l) l.style.letterSpacing = `${lerp(0.22, -0.01, ent).toFixed(4)}em`
            const seg = segRef.current[i]
            if (seg) seg.style.transform = `scaleX(${faixa(t, a, b).toFixed(4)})`
        })
        mostrar(barraRef.current, janela(t, 0.32, 0.36) * (1 - janela(t, 0.98, 1.04)))
    })

    return (
        <div className={filme ? 'absolute inset-0 z-30' : 'relative py-28'}>
            <div
                ref={fase1Ref}
                style={oculto}
                className={filme ? 'absolute inset-0 flex flex-col justify-center px-4 pt-[var(--cabecalho)] sm:px-8 lg:px-16' : 'px-4 sm:px-8'}
            >
                <Kicker className="mb-6 baixo:mb-3">05 — Discipulado</Kicker>
                <h2 className="display sombra-filme text-[min(19vw,14dvh)] leading-[0.86] sm:text-[min(12vw,18dvh)]">
                    {['Ninguém', 'caminha'].map((txt, i) => (
                        <span key={txt} className="mascara">
                            <span ref={(el) => { linhasRef.current[i] = el }} data-anim>
                                {txt}
                            </span>
                        </span>
                    ))}
                    <span className="mascara">
                        <span ref={(el) => { linhasRef.current[2] = el }} data-anim>
                            sozinho<span className="text-acido">.</span>
                        </span>
                    </span>
                </h2>
                <p ref={subRef} style={oculto} className="mt-7 max-w-[30ch] text-[17px] leading-snug text-osso/90 baixo:mt-3 baixo:text-[15px] sm:text-xl 3xl:text-2xl">
                    Acreditamos em uma geração cuidada, treinada e enviada.
                </p>
            </div>

            <div className={filme ? '' : 'mt-20 flex flex-col gap-16 px-4 sm:px-8'}>
                {PALAVRAS.map((p, i) => (
                    <div
                        key={p.palavra}
                        ref={(el) => { palavrasRef.current[i] = el }}
                        data-anim
                        style={oculto}
                        className={
                            filme
                                ? 'absolute inset-0 flex flex-col items-center justify-center px-4 pt-[var(--cabecalho)] text-center'
                                : 'flex flex-col items-start'
                        }
                    >
                        <span className="mono mb-3 text-[11px] text-acido">
                            {String(i + 1).padStart(2, '0')} / 03
                        </span>
                        <h3 className="display sombra-filme text-[min(21vw,28dvh)] leading-[1.05]">
                            <span ref={(el) => { letrasRef.current[i] = el }} className="inline-block">
                                {p.palavra}
                            </span>
                        </h3>
                        <p className="mt-5 max-w-[28ch] text-[16px] leading-snug text-osso/85 baixo:mt-2 sm:text-lg 3xl:text-2xl">{p.texto}</p>
                    </div>
                ))}
            </div>

            {filme && (
                <div
                    ref={barraRef}
                    aria-hidden
                    style={oculto}
                    className="absolute bottom-[12dvh] left-1/2 flex w-[min(320px,70vw)] -translate-x-1/2 gap-2 baixo:bottom-[10dvh] 3xl:w-[440px]"
                >
                    {PALAVRAS.map((p, i) => (
                        <span key={p.palavra} className="relative h-[3px] flex-1 overflow-hidden bg-osso/20">
                            <span
                                ref={(el) => { segRef.current[i] = el }}
                                className="absolute inset-0 origin-left bg-acido"
                                style={{ transform: 'scaleX(0)' }}
                            />
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}
