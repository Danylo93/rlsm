'use client'

/**
 * Progresso.
 *  - <ScrollProgress/>: dentro do filme — trilho de capítulos + timecode.
 *  - <BarraProgresso/>: linha fina no topo da página inteira.
 */

import { useContext, useEffect, useRef } from 'react'
import { ContextoFilme, useFilme } from './contexto'

/** 1 vh de rolagem ≈ 4 quadros a 24 fps — só para o timecode "parecer filme" */
const QUADROS_POR_VH = 4

function timecode(g: number) {
    const totalQ = Math.floor(g * QUADROS_POR_VH)
    const q = totalQ % 24
    const s = Math.floor(totalQ / 24)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(q)}`
}

export default function ScrollProgress({ capitulos = true, rotulo }: { capitulos?: boolean; rotulo?: string }) {
    const ctx = useContext(ContextoFilme)
    const tcRef = useRef<HTMLSpanElement>(null)
    const cenaRef = useRef<HTMLSpanElement>(null)
    const itensRef = useRef<Array<HTMLLIElement | null>>([])
    const barraRef = useRef<HTMLSpanElement>(null)
    const ultimo = useRef(-1)

    useFilme((e) => {
        if (tcRef.current) tcRef.current.textContent = timecode(e.g)
        if (barraRef.current) barraRef.current.style.transform = `scaleY(${e.p.toFixed(4)})`
        if (e.atual === ultimo.current || !ctx) return
        ultimo.current = e.atual
        const c = ctx.cenas[e.atual]
        if (cenaRef.current) cenaRef.current.textContent = `${String(c.numero).padStart(2, '0')} — ${c.capitulo}`
        itensRef.current.forEach((li, i) => {
            if (!li) return
            const ativo = i === e.atual
            li.dataset.ativo = ativo ? '1' : '0'
        })
    })

    if (!ctx) return null

    return (
        <>
            {/* HUD inferior: cena + timecode */}
            <div
                aria-hidden
                className="ui-escala mono pointer-events-none absolute bottom-4 left-4 right-4 z-40 flex items-end justify-between text-[10px] text-osso/70 sm:bottom-6 sm:left-8 sm:right-8 sm:text-[11px]"
            >
                <span ref={cenaRef} className="max-w-[55%] truncate">
                    {rotulo}
                </span>
                <span className="flex items-center gap-2 tabular-nums">
                    <span className="h-1.5 w-1.5 rounded-full bg-brasa animate-[piscar_1.6s_steps(1)_infinite]" />
                    TC <span ref={tcRef}>00:00:00:00</span>
                </span>
            </div>

            {capitulos && (
                <nav
                    aria-label="Capítulos"
                    className="ui-escala absolute right-4 top-1/2 z-40 hidden -translate-y-1/2 md:block baixo:hidden lg:right-8"
                >
                    <div className="relative flex gap-4">
                        <span className="relative w-px bg-osso/15">
                            <span ref={barraRef} className="absolute inset-0 origin-top bg-acido" style={{ transform: 'scaleY(0)' }} />
                        </span>
                        <ol className="flex flex-col gap-3">
                            {ctx.cenas.map((c, i) => (
                                <li
                                    key={c.id}
                                    ref={(el) => {
                                        itensRef.current[i] = el
                                    }}
                                    data-ativo={i === 0 ? '1' : '0'}
                                    className="group mono text-[10px] text-osso/35 transition-colors duration-500 data-[ativo=1]:text-osso"
                                >
                                    {c.ancora ? (
                                        <a href={`#${c.ancora}`} className="flex items-center gap-2 hover:text-acido">
                                            <span className="tabular-nums">{String(c.numero).padStart(2, '0')}</span>
                                            <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-500 group-data-[ativo=1]:max-w-40">
                                                {c.capitulo}
                                            </span>
                                        </a>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <span className="tabular-nums">{String(c.numero).padStart(2, '0')}</span>
                                            <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-500 group-data-[ativo=1]:max-w-40">
                                                {c.capitulo}
                                            </span>
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </div>
                </nav>
            )}
        </>
    )
}

export function BarraProgresso() {
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        let raf = 0
        const atualizar = () => {
            raf = 0
            const max = document.documentElement.scrollHeight - window.innerHeight
            const p = max > 0 ? window.scrollY / max : 0
            if (ref.current) ref.current.style.transform = `scaleX(${p.toFixed(4)})`
        }
        const agendar = () => {
            if (!raf) raf = requestAnimationFrame(atualizar)
        }
        atualizar()
        window.addEventListener('scroll', agendar, { passive: true })
        window.addEventListener('resize', agendar)
        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener('scroll', agendar)
            window.removeEventListener('resize', agendar)
        }
    }, [])
    return (
        <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px]">
            <div ref={ref} className="faixa-espectro h-full origin-left" style={{ transform: 'scaleX(0)' }} />
        </div>
    )
}
