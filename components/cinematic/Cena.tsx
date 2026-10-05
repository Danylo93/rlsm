'use client'

/**
 * Cena — seção fixada (sticky) controlada pela rolagem, sem canvas.
 * Usada por Números e Galeria. Os filhos leem o progresso 0..1 com
 * useProgresso(); com prefers-reduced-motion a seção vira fluxo normal.
 */

import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ContextoProgresso, criarBarramento, useMovimentoReduzido } from './contexto'

interface Props {
    id?: string
    rotulo: string
    /** altura total da seção em vh (a rolagem útil é alturaVh - 100) */
    alturaVh: number
    className?: string
    /** classes do palco no modo estático */
    classeEstatica?: string
    children: ReactNode
}

const nada = () => () => {}

export default function Cena({ id, rotulo, alturaVh, className = '', classeEstatica = '', children }: Props) {
    const reduzido = useMovimentoReduzido()
    const barramento = useMemo(() => criarBarramento<number>(), [])
    const valorFilme = useMemo(() => ({ modo: 'filme' as const, inscrever: barramento.inscrever }), [barramento])
    const valorEstatico = useMemo(() => ({ modo: 'estatico' as const, inscrever: nada }), [])
    const secaoRef = useRef<HTMLElement>(null)

    useEffect(() => {
        if (reduzido) return
        const secao = secaoRef.current!
        let p = 0
        let sujo = true
        let visivel = false
        const st = ScrollTrigger.create({
            trigger: secao,
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
                p = self.progress
                sujo = true
            },
        })
        const vis = ScrollTrigger.create({
            trigger: secao,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self) => {
                visivel = self.isActive
                sujo = true
            },
        })
        p = st.progress
        visivel = vis.isActive
        const quadro = () => {
            if (!sujo || !visivel) return
            sujo = false
            barramento.emitir(p)
        }
        gsap.ticker.add(quadro)
        barramento.emitir(p)
        return () => {
            gsap.ticker.remove(quadro)
            st.kill()
            vis.kill()
        }
    }, [reduzido, barramento])

    if (reduzido) {
        return (
            <ContextoProgresso.Provider value={valorEstatico}>
                <section id={id} aria-label={rotulo} className={`relative ${className} ${classeEstatica}`}>
                    {children}
                </section>
            </ContextoProgresso.Provider>
        )
    }

    return (
        <ContextoProgresso.Provider value={valorFilme}>
            <section
                ref={secaoRef}
                id={id}
                aria-label={rotulo}
                className={`relative ${className}`}
                style={{ height: `${alturaVh}vh` }}
            >
                <div className="sticky top-0 h-[100dvh] overflow-hidden">{children}</div>
            </section>
        </ContextoProgresso.Provider>
    )
}
