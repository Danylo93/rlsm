'use client'

/**
 * CENA 11 — CTA final. A multidão sobe do preto, a câmera recua e o convite
 * aparece linha por linha. Última cena: nada sai, os botões ficam.
 */

import { useRef } from 'react'
import { mostrar, mover, useCena, useModo, useOculto } from '@/components/cinematic/contexto'
import { janela } from '@/components/cinematic/motor'
import Botao from '@/components/ui/Botao'
import { Kicker } from '@/components/ui/Tipo'
import { ctas } from '@/data/site'

const LINHAS = ['Se existe', 'algo a mais,', 'nós queremos']

export default function CTAFinal() {
    const filme = useModo() === 'filme'
    const oculto = useOculto()
    const linhasRef = useRef<Array<HTMLSpanElement | null>>([])
    const kickerRef = useRef<HTMLDivElement>(null)
    const raizRef = useRef<HTMLDivElement>(null)
    const botoesRef = useRef<HTMLDivElement>(null)
    const falarRef = useRef<HTMLAnchorElement>(null)

    useCena('cta', (t) => {
        // só existe na tela quando a cena começa (nada espia durante o manifesto)
        mostrar(raizRef.current, t > -0.02 ? 1 : 0)
        mostrar(kickerRef.current, janela(t, -0.02, 0.06))
        linhasRef.current.forEach((el, i) => {
            const k = janela(t, 0.0 + i * 0.035, 0.13 + i * 0.035)
            mover(el, `translate3d(0, ${((1 - k) * 140).toFixed(2)}%, 0)`)
        })
        const b = janela(t, 0.26, 0.36)
        mostrar(botoesRef.current, b, true)
        mover(botoesRef.current, `translate3d(0, ${((1 - b) * 28).toFixed(1)}px, 0)`)
        mostrar(falarRef.current, janela(t, 0.32, 0.42), true)
    })

    return (
        <div ref={raizRef} style={oculto} className={filme ? 'absolute inset-0 z-30' : 'relative'}>
            <div className="flex h-full min-h-[100svh] flex-col justify-end px-4 pb-[13dvh] pt-28 baixo:pb-[9dvh] baixo:pt-[var(--cabecalho)] sm:px-8 lg:px-16">
                <div ref={kickerRef} style={oculto}>
                    <Kicker className="mb-5 baixo:mb-2">11 — Fazer parte</Kicker>
                </div>
                <h2 className="display sombra-filme text-[min(15vw,10.5dvh)] leading-[0.86] sm:text-[min(10vw,14dvh)] baixo:text-[12dvh]">
                    {[...LINHAS, 'viver.'].map((l, i) => (
                        <span key={l} className="mascara">
                            <span
                                ref={(el) => {
                                    linhasRef.current[i] = el
                                }}
                                data-anim
                                className={i === 3 ? 'text-acido' : ''}
                                style={filme ? { transform: 'translate3d(0,140%,0)' } : undefined}
                            >
                                {l}
                            </span>
                        </span>
                    ))}
                </h2>
                <div ref={botoesRef} style={oculto} className="mt-8 flex flex-col items-start gap-3 baixo:mt-4 sm:flex-row sm:flex-wrap">
                    <Botao href={ctas.fazerParte} tamanho="lg" cursor="BORA">
                        Quero fazer parte
                    </Botao>
                    <Botao href={ctas.celula} variante="contorno" cursor="CÉLULA">
                        Encontre uma célula
                    </Botao>
                </div>
                <a
                    ref={falarRef}
                    href={ctas.falar}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={oculto}
                    className="ui-escala mono mt-6 inline-flex w-fit items-center gap-2 text-[11px] baixo:mt-3 text-osso/75 underline-offset-4 transition-colors hover:text-acido hover:underline"
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-acido" aria-hidden /> Fale com a gente no WhatsApp ↗
                </a>
            </div>
        </div>
    )
}
