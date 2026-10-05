'use client'

/**
 * CENA 03 — Presença.
 * A palavra gigante fica ENTRE a foto e a camada de frente do canvas
 * (z-10 < frente z-20): a mão levantada e as cabeças passam na frente dela.
 */

import { useRef } from 'react'
import { mostrar, mover, useCena, useModo, useOculto } from '@/components/cinematic/contexto'
import { janela, lerp, pulso, smooth, clamp } from '@/components/cinematic/motor'

export default function Presenca() {
    const filme = useModo() === 'filme'
    const oculto = useOculto()
    const palavraRef = useRef<HTMLHeadingElement>(null)
    const letrasRef = useRef<HTMLSpanElement>(null)
    const fraseRef = useRef<HTMLDivElement>(null)

    useCena('presenca', (t) => {
        const a = pulso(t, -0.06, 0.14, 0.86, 1.04)
        mostrar(palavraRef.current, a)
        const e = smooth(clamp((t + 0.25) / 1.25))
        mover(
            palavraRef.current,
            `translate3d(0, ${lerp(5, -5, e).toFixed(2)}dvh, 0) scale(${lerp(0.84, 1.07, e).toFixed(4)})`
        )
        if (letrasRef.current) letrasRef.current.style.letterSpacing = `${lerp(0.16, -0.012, janela(t, -0.25, 0.55)).toFixed(4)}em`
        const f = pulso(t, 0.4, 0.55, 0.9, 1.02)
        mostrar(fraseRef.current, f)
        mover(fraseRef.current, `translate3d(0, ${((1 - janela(t, 0.4, 0.55)) * 36).toFixed(1)}px, 0)`)
    })

    if (!filme) {
        return (
            <div className="flex min-h-[100svh] flex-col items-center justify-center gap-10 px-4 text-center">
                <h2 className="display text-[min(25vw,40dvh)] leading-none">Presença</h2>
                <p className="max-w-2xl text-[clamp(22px,3vw,38px)] font-medium leading-tight">
                    Antes de qualquer movimento, <span className="text-acido">existe um encontro.</span>
                </p>
            </div>
        )
    }

    return (
        // sem z-index aqui de propósito: os filhos se intercalam com o canvas de frente
        <div className="absolute inset-0">
            <h2
                ref={palavraRef}
                data-anim
                style={oculto}
                className="display absolute inset-x-0 top-[24%] z-10 text-center text-[min(23.5vw,44dvh)] leading-none retrato:top-[30%] baixo:top-[24%] baixo:text-[38dvh]"
            >
                <span ref={letrasRef} className="inline-block whitespace-nowrap pl-[0.16em]">
                    Presença
                </span>
            </h2>
            <div
                ref={fraseRef}
                style={oculto}
                className="absolute inset-x-0 bottom-[17dvh] z-30 px-6 text-center baixo:bottom-[12dvh] sm:bottom-[16dvh]"
            >
                <p className="mx-auto max-w-[22ch] text-[clamp(24px,3.2vw,56px)] font-semibold baixo:text-[22px] leading-[1.08] tracking-tight sm:max-w-3xl">
                    Antes de qualquer movimento, <span className="text-acido">existe um encontro.</span>
                </p>
            </div>
        </div>
    )
}
