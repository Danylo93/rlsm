'use client'

/**
 * CENA 02 — Quem somos.
 * As linhas entram pelas laterais enquanto a câmera faz um pan lento.
 */

import { useRef } from 'react'
import { mostrar, mover, useCena, useModo, useOculto } from '@/components/cinematic/contexto'
import { janela } from '@/components/cinematic/motor'
import { Kicker } from '@/components/ui/Tipo'

export default function QuemSomos() {
    const filme = useModo() === 'filme'
    const oculto = useOculto()
    const raizRef = useRef<HTMLDivElement>(null)
    const kickerRef = useRef<HTMLDivElement>(null)
    const l1Ref = useRef<HTMLSpanElement>(null)
    const l2Ref = useRef<HTMLSpanElement>(null)
    const textoRef = useRef<HTMLParagraphElement>(null)

    useCena('geracao', (t) => {
        const saida = janela(t, 0.64, 0.82)
        mostrar(raizRef.current, (t > -0.45 ? 1 : 0) * (1 - saida))
        const k = janela(t, -0.2, 0.06)
        mostrar(kickerRef.current, k)
        mover(kickerRef.current, `translate3d(${((1 - k) * -40).toFixed(1)}px,0,0)`)
        // linhas vêm de lados opostos e continuam derivando (parallax)
        const a = janela(t, -0.12, 0.24)
        const b = janela(t, -0.06, 0.3)
        mover(l1Ref.current, `translate3d(${((1 - a) * -70 + (t - 0.5) * -4 - saida * 12).toFixed(2)}vw,0,0)`)
        mover(l2Ref.current, `translate3d(${((1 - b) * 70 + (t - 0.5) * 4 + saida * 12).toFixed(2)}vw,0,0)`)
        const c = janela(t, 0.22, 0.4)
        mostrar(textoRef.current, c)
        mover(textoRef.current, `translate3d(0,${((1 - c) * 30).toFixed(1)}px,0)`)
    })

    return (
        <div
            ref={raizRef}
            style={oculto}
            className={filme ? 'absolute inset-0 z-30 overflow-hidden' : 'relative'}
        >
            <div className="flex h-full min-h-[100svh] flex-col justify-end px-4 pb-[16dvh] pt-28 baixo:pb-[13dvh] baixo:pt-[var(--cabecalho)] sm:px-8 lg:px-16">
                <div ref={kickerRef} style={oculto}>
                    <Kicker>Não é só um culto.</Kicker>
                </div>
                <h2 className="display sombra-filme mt-5 text-[min(20vw,17dvh)] leading-[0.82] baixo:mt-3 sm:text-[min(15vw,24dvh)] lg:text-[min(13vw,24dvh)] xl:text-[min(15vw,24dvh)]">
                    <span ref={l1Ref} data-anim className="block">
                        É uma
                    </span>
                    <span ref={l2Ref} data-anim className="block pl-[6vw]">
                        geração<span className="text-acido">.</span>
                    </span>
                </h2>
                <p
                    ref={textoRef}
                    style={oculto}
                    className="mt-6 max-w-[34ch] text-[17px] leading-snug text-osso/90 baixo:absolute baixo:bottom-[13dvh] baixo:right-8 baixo:mt-0 baixo:max-w-[32ch] baixo:text-[15px] sm:text-lg xl:absolute xl:bottom-[18dvh] xl:right-16 xl:mt-0 xl:max-w-[30ch] xl:text-xl 3xl:text-2xl"
                >
                    Somos jovens decididos a viver um relacionamento real com Jesus e levar essa vida para nossa geração.
                </p>
            </div>
        </div>
    )
}
