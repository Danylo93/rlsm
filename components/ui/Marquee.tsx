'use client'

/**
 * Marquee infinito. Corre devagar; quando a pessoa inverte o sentido da
 * rolagem, inverte junto (e acelera um pouco com a velocidade da rolagem).
 */

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { rolagem } from '@/components/cinematic/SmoothScroll'

type Variante = 'acido' | 'escuro' | 'contorno' | 'brasa'

interface Props {
    itens: string[]
    variante?: Variante
    /** graus */
    inclinacao?: number
    /** px por segundo */
    velocidade?: number
    reverso?: boolean
    /** segue o sentido da rolagem */
    reagir?: boolean
    tamanho?: 'md' | 'xl'
    className?: string
}

const estilos: Record<Variante, string> = {
    acido: 'faixa-espectro',
    brasa: 'faixa-laranja',
    escuro: 'faixa-azul border-y border-white/20',
    contorno: 'bg-transparent text-osso',
}

export default function Marquee({
    itens,
    variante = 'acido',
    inclinacao = 0,
    velocidade = 60,
    reverso = false,
    reagir = true,
    tamanho = 'md',
    className = '',
}: Props) {
    const trilhoRef = useRef<HTMLDivElement>(null)
    const caixaRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const trilho = trilhoRef.current!
        const caixa = caixaRef.current!
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

        let x = 0
        let visivel = false
        let sentido = reverso ? -1 : 1
        const io = new IntersectionObserver(([en]) => (visivel = en.isIntersecting), { rootMargin: '100px' })
        io.observe(caixa)

        const tick = (_t: number, dt: number) => {
            if (!visivel) return
            const metade = trilho.scrollWidth / 2
            if (!metade) return
            if (reagir) sentido = (reverso ? -1 : 1) * rolagem.direcao
            const extra = Math.min(900, Math.abs(rolagem.velocidade) * 22)
            x -= sentido * (velocidade + extra) * (dt / 1000)
            if (x <= -metade) x += metade
            if (x > 0) x -= metade
            trilho.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`
        }
        gsap.ticker.add(tick)
        return () => {
            gsap.ticker.remove(tick)
            io.disconnect()
        }
    }, [reverso, reagir, velocidade])

    const tipo =
        tamanho === 'xl' ? 'display text-[clamp(64px,13vw,220px)] py-2' : 'display text-[clamp(26px,3.4vw,46px)] py-3 sm:py-4'
    // cada unidade carrega o próprio espaço à direita: o laço fecha sem emenda
    const espaco = tamanho === 'xl' ? 'mx-[0.18em]' : 'mx-[0.32em]'
    const contorno = variante === 'contorno' ? 'contorno' : ''

    // repete o bastante para cobrir telas largas; a segunda metade é a cópia do laço
    const bloco = Array.from({ length: 4 }, () => itens).flat()

    return (
        // a faixa girada passa da largura da tela: o invólucro corta na horizontal
        // (sem isso a página inteira ganha rolagem lateral)
        <div className={`relative z-10 overflow-x-clip ${inclinacao ? 'py-[1.2vw]' : ''} ${className}`}>
            <div
                ref={caixaRef}
                className={`relative overflow-hidden ${estilos[variante]}`}
                style={{ transform: inclinacao ? `rotate(${inclinacao}deg) scale(1.04)` : undefined }}
            >
                <p className="sr-only">{itens.join(' · ')}</p>
                <div ref={trilhoRef} aria-hidden className={`flex w-max whitespace-nowrap will-change-transform ${tipo}`}>
                    {[0, 1].map((metade) => (
                        <div key={metade} className="flex shrink-0 items-center">
                            {bloco.map((item, i) => (
                                <span key={i} className="flex items-center">
                                    <span className={`pt-[0.06em] ${contorno}`}>{item}</span>
                                    <Estrela className={`${espaco} ${variante === 'contorno' ? 'text-acido' : ''}`} />
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export function Estrela({ className = '' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden className={`h-[0.5em] w-[0.5em] shrink-0 ${className}`} fill="currentColor">
            <path d="M12 0c.6 6.6 5.4 11.4 12 12-6.6.6-11.4 5.4-12 12-.6-6.6-5.4-11.4-12-12C6.6 11.4 11.4 6.6 12 0Z" />
        </svg>
    )
}
