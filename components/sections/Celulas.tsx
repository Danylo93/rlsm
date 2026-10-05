'use client'

/**
 * CENA 04 — Células.
 * Entra com corte seco. Duas frases em sequência; um risco (cor brasa) corta
 * "SÓ AQUI". O botão só aparece depois do texto, sem interromper o filme.
 */

import { useRef } from 'react'
import { mostrar, mover, useCena, useModo, useOculto } from '@/components/cinematic/contexto'
import { janela } from '@/components/cinematic/motor'
import Botao from '@/components/ui/Botao'
import { Kicker } from '@/components/ui/Tipo'
import { ctas } from '@/data/site'

/** linha que sobe pela máscara ao entrar e continua subindo ao sair */
function linha(el: HTMLElement | null, t: number, ent: [number, number], sai?: [number, number]) {
    const i = janela(t, ent[0], ent[1])
    const o = sai ? janela(t, sai[0], sai[1]) : 0
    mover(el, `translate3d(0, ${((1 - i) * 140 - o * 140).toFixed(2)}%, 0)`)
}

export default function Celulas() {
    const filme = useModo() === 'filme'
    const oculto = useOculto()
    const faseARef = useRef<HTMLDivElement>(null)
    const faseBRef = useRef<HTMLDivElement>(null)
    const a1 = useRef<HTMLSpanElement>(null)
    const a2 = useRef<HTMLSpanElement>(null)
    const a3 = useRef<HTMLSpanElement>(null)
    const riscoRef = useRef<HTMLSpanElement>(null)
    const b1 = useRef<HTMLSpanElement>(null)
    const b2 = useRef<HTMLSpanElement>(null)
    const textoRef = useRef<HTMLParagraphElement>(null)
    const botaoRef = useRef<HTMLDivElement>(null)
    const kickerRef = useRef<HTMLDivElement>(null)

    useCena('celulas', (t) => {
        mostrar(faseARef.current, t > -0.12 && t < 0.5 ? 1 : 0)
        mostrar(kickerRef.current, janela(t, -0.05, 0.05) * (1 - janela(t, 0.38, 0.45)))
        linha(a1.current, t, [-0.06, 0.06], [0.38, 0.46])
        linha(a2.current, t, [-0.03, 0.09], [0.39, 0.47])
        linha(a3.current, t, [0, 0.12], [0.4, 0.48])
        if (riscoRef.current) riscoRef.current.style.transform = `scaleX(${janela(t, 0.17, 0.3).toFixed(4)})`

        const saidaB = janela(t, 0.95, 1.06)
        mostrar(faseBRef.current, (t > 0.46 ? 1 : 0) * (1 - saidaB))
        linha(b1.current, t, [0.5, 0.6])
        linha(b2.current, t, [0.53, 0.63])
        const c = janela(t, 0.6, 0.7)
        mostrar(textoRef.current, c)
        mover(textoRef.current, `translate3d(0, ${((1 - c) * 24).toFixed(1)}px, 0)`)
        const d = janela(t, 0.72, 0.8)
        mostrar(botaoRef.current, d, true)
        mover(botaoRef.current, `translate3d(0, ${((1 - d) * 24).toFixed(1)}px, 0)`)
    })

    const titulo = 'display sombra-filme text-[min(15.5vw,12.5dvh)] leading-[0.94] sm:text-[min(12.5vw,17dvh)] sm:leading-[0.86]'

    return (
        <div className={filme ? 'absolute inset-0 z-30' : 'relative py-28'}>
            {/* fase A */}
            <div
                ref={faseARef}
                style={oculto}
                className={filme ? 'absolute inset-0 flex flex-col justify-center px-4 pt-[var(--cabecalho)] sm:px-8 lg:px-16' : 'px-4 sm:px-8'}
            >
                <div ref={kickerRef} style={oculto} className="mb-6 baixo:mb-3">
                    <Kicker>04 — Células</Kicker>
                </div>
                <h2 className={titulo}>
                    <span className="mascara">
                        <span ref={a1} data-anim>
                            A igreja
                        </span>
                    </span>
                    <span className="mascara">
                        <span ref={a2} data-anim>
                            não acontece
                        </span>
                    </span>
                    <span className="mascara">
                        <span ref={a3} data-anim className="relative !inline-block">
                            só aqui.
                            <span
                                ref={riscoRef}
                                aria-hidden
                                className="absolute left-[-2%] top-[46%] h-[0.085em] w-[104%] origin-left bg-brasa"
                                style={{ transform: filme ? 'scaleX(0)' : 'scaleX(1)' }}
                            />
                        </span>
                    </span>
                </h2>
            </div>

            {/* fase B */}
            <div
                ref={faseBRef}
                style={oculto}
                className={
                    filme
                        ? 'absolute inset-0 flex flex-col justify-end px-4 pb-[15dvh] baixo:pb-[11dvh] sm:px-8 lg:px-16'
                        : 'mt-24 px-4 sm:px-8'
                }
            >
                <h2 className={titulo}>
                    <span className="mascara">
                        <span ref={b1} data-anim>
                            Ela acontece
                        </span>
                    </span>
                    <span className="mascara">
                        <span ref={b2} data-anim className="text-acido">
                            nas casas.
                        </span>
                    </span>
                </h2>
                <div className="mt-7 flex flex-col gap-7 baixo:mt-4 baixo:gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <p ref={textoRef} style={oculto} className="max-w-[34ch] text-[17px] leading-snug text-osso/90 baixo:text-[15px] sm:text-xl 3xl:text-2xl">
                        Células são onde relacionamento, discipulado e propósito se encontram.
                    </p>
                    <div ref={botaoRef} style={oculto}>
                        <Botao href={ctas.celula} icone="whatsapp" cursor="BORA">
                            Encontre uma célula
                        </Botao>
                    </div>
                </div>
            </div>
        </div>
    )
}
