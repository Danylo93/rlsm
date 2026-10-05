'use client'

/**
 * CENA 01 — Abertura.
 * Começa como um filme: o título entra subindo pela máscara; ao rolar ele
 * encolhe, as linhas se afastam e a câmera (canvas) avança para a multidão.
 */

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { mostrar, mover, useCena, useModo } from '@/components/cinematic/contexto'
import { clamp, janela, smooth } from '@/components/cinematic/motor'

export default function Hero() {
    const filme = useModo() === 'filme'
    const blocoRef = useRef<HTMLDivElement>(null)
    const l1Ref = useRef<HTMLSpanElement>(null)
    const l2Ref = useRef<HTMLSpanElement>(null)
    const l3Ref = useRef<HTMLSpanElement>(null)
    const legendaRef = useRef<HTMLDivElement>(null)
    const indicadorRef = useRef<HTMLDivElement>(null)
    const lateralRef = useRef<HTMLParagraphElement>(null)
    const pularRef = useRef<HTMLAnchorElement>(null)

    useCena('abertura', (t) => {
        const s = smooth(clamp(t))
        mover(blocoRef.current, `translate3d(0, ${(-7 * s).toFixed(2)}dvh, 0) scale(${(1 - 0.3 * s).toFixed(4)})`)
        mostrar(blocoRef.current, 1 - janela(t, 0.32, 0.74))
        mover(l1Ref.current, `translate3d(${(-10 * s).toFixed(2)}vw, 0, 0)`)
        mover(l2Ref.current, `translate3d(${(10 * s).toFixed(2)}vw, 0, 0)`)
        if (l1Ref.current) l1Ref.current.style.letterSpacing = `${(-0.012 + 0.05 * s).toFixed(4)}em`
        if (l2Ref.current) l2Ref.current.style.letterSpacing = `${(-0.012 + 0.05 * s).toFixed(4)}em`
        if (l3Ref.current) l3Ref.current.style.letterSpacing = `${(0.42 + 0.5 * s).toFixed(3)}em`
        mostrar(legendaRef.current, 1 - janela(t, 0.04, 0.26))
        mostrar(indicadorRef.current, 1 - janela(t, 0, 0.08))
        mostrar(lateralRef.current, 1 - janela(t, 0.4, 0.8))
        mostrar(pularRef.current, 1 - janela(t, 0.5, 0.9), true)
    })

    // entrada ao carregar (não é a narrativa — a narrativa é a rolagem)
    useEffect(() => {
        if (!filme) return
        const raiz = blocoRef.current?.closest('[data-filme]')
        if (!raiz) return
        const linhas = raiz.querySelectorAll<HTMLElement>('[data-intro]')
        const fades = raiz.querySelectorAll<HTMLElement>('[data-intro-fade]')
        const tl = gsap.timeline({ delay: 0.2 })
        // y: 0 explícito — senão o GSAP herda o translateY(140%) do CSS como px
        tl.fromTo(linhas, { yPercent: 140, y: 0 }, { yPercent: 0, y: 0, duration: 1.5, stagger: 0.12, ease: 'expo.out' }).fromTo(
            fades,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: 'power3.out' },
            '-=0.9'
        )
        return () => {
            tl.kill()
        }
    }, [filme])

    return (
        <div className={filme ? 'absolute inset-0 z-30' : 'relative'}>
            <div className="flex h-full min-h-[100svh] flex-col items-center justify-center px-4 pt-[var(--cabecalho)] text-center">
                <div ref={blocoRef} data-anim className="flex origin-center flex-col items-center">
                    <h1 className="display sombra-filme flex flex-col items-center" aria-label="Radicais Livres São Miguel">
                        <span ref={l1Ref} className="mascara" aria-hidden>
                            <span data-intro className="text-[min(23vw,30dvh)] leading-[0.8] baixo:text-[24dvh] md:text-[min(19vw,31dvh)]">
                                Radicais
                            </span>
                        </span>
                        <span ref={l2Ref} className="mascara" aria-hidden>
                            <span data-intro className="text-[min(23vw,30dvh)] leading-[0.8] baixo:text-[24dvh] md:text-[min(19vw,31dvh)]">
                                Livres
                            </span>
                        </span>
                        <span ref={l3Ref} className="mascara mt-[1.6dvh] tracking-[0.42em]" aria-hidden>
                            <span data-intro className="wide pl-[0.42em] text-[clamp(15px,2.3vw,32px)] text-acido">
                                São Miguel
                            </span>
                        </span>
                    </h1>
                    <div ref={legendaRef} className="ui-escala mt-[3.2dvh] flex flex-col items-center gap-3 baixo:gap-1.5">
                        <p data-intro-fade className="mono text-[10px] text-osso/70 sm:text-[11px]">
                            Videira São Miguel
                        </p>
                        <p data-intro-fade className="wide text-[12px] tracking-[0.18em] sm:text-[14px]">
                            Uma geração que se levanta.
                        </p>
                    </div>
                </div>
            </div>

            {filme && (
                <>
                    {/* indicador de rolagem */}
                    <div
                        ref={indicadorRef}
                        aria-hidden
                        className="ui-escala pointer-events-none absolute bottom-14 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 baixo:hidden sm:bottom-16"
                    >
                        <span data-intro-fade className="mono text-[10px] text-osso/80">
                            Role para viver ↓
                        </span>
                        <span className="relative h-12 w-px overflow-hidden bg-osso/15">
                            <span className="absolute inset-0 bg-acido animate-[descer_2.2s_var(--ease-filme)_infinite]" />
                        </span>
                    </div>

                    {/* assinatura lateral editorial — a rolagem controla o <p>, o fade de
                        entrada controla o <span>: um dono por propriedade, senão o fade
                        reacende o texto depois que a rolagem já o escondeu */}
                    <p
                        ref={lateralRef}
                        aria-hidden
                        className="mono pointer-events-none absolute left-4 top-1/2 hidden -translate-y-1/2 rotate-180 text-[10px] text-osso/50 [writing-mode:vertical-rl] md:block lg:left-8"
                    >
                        <span data-intro-fade className="inline-block">
                            RL/SM ✦ Filme nº 01 ✦ 2026
                        </span>
                    </p>

                    <a
                        ref={pularRef}
                        href="#numeros"
                        className="ui-escala mono absolute bottom-14 right-4 z-10 text-[10px] baixo:bottom-10 text-osso/60 underline-offset-4 transition-colors hover:text-acido hover:underline sm:bottom-16 sm:right-8"
                    >
                        <span data-intro-fade className="inline-block">
                            Pular o filme →
                        </span>
                    </a>
                </>
            )}
        </div>
    )
}
