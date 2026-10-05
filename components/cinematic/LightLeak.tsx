'use client'

/**
 * Light leak — vazamento de luz de película, em "screen" sobre o canvas.
 * A intensidade vem da cena (luz.vazamento) e cresce nas transições;
 * a posição desliza com a rolagem (vai e volta junto com o filme).
 */

import { useContext, useRef } from 'react'
import { ContextoFilme, useFilme } from './contexto'
import { lerp } from './motor'

export default function LightLeak() {
    const ctx = useContext(ContextoFilme)
    const quenteRef = useRef<HTMLDivElement>(null)
    const frioRef = useRef<HTMLDivElement>(null)

    useFilme((e) => {
        if (!ctx) return
        const { cenas, linha } = ctx
        const cena = cenas[e.atual]
        let intensidade = cena.luz?.vazamento ?? 0
        // perto de uma virada de cena a película "queima" um pouco
        const prox = cenas[e.atual + 1]
        if (prox?.entrada) {
            const ini = linha.inicio[e.atual + 1]
            const d = ini - e.g
            if (d < prox.entrada.vh && d > 0) {
                const k = 1 - d / prox.entrada.vh
                intensidade = lerp(intensidade, prox.luz?.vazamento ?? 0, k) + Math.sin(Math.PI * k) * 0.35
            }
        }
        const x = Math.sin(e.g * 0.012) * 30
        const y = Math.cos(e.g * 0.009) * 18
        if (quenteRef.current) {
            quenteRef.current.style.opacity = Math.min(1, intensidade).toFixed(3)
            quenteRef.current.style.transform = `translate3d(${x}vw, ${y}vh, 0) rotate(${e.g * 0.05}deg)`
        }
        if (frioRef.current) {
            frioRef.current.style.opacity = Math.min(0.6, intensidade * 0.55).toFixed(3)
            frioRef.current.style.transform = `translate3d(${-x * 0.8}vw, ${-y}vh, 0)`
        }
    })

    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[5] overflow-hidden mix-blend-screen">
            <div
                ref={quenteRef}
                className="absolute -left-[30%] -top-[40%] h-[120%] w-[90%] opacity-0"
                style={{
                    background:
                        'radial-gradient(closest-side, rgba(255,120,40,0.55), rgba(255,80,20,0.18) 55%, transparent 75%)',
                }}
            />
            <div
                ref={frioRef}
                className="absolute -bottom-[45%] -right-[25%] h-[110%] w-[80%] opacity-0"
                style={{
                    background:
                        'radial-gradient(closest-side, rgba(255,214,140,0.42), rgba(255,170,90,0.12) 60%, transparent 78%)',
                }}
            />
        </div>
    )
}
