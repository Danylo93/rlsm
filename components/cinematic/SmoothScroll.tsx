'use client'

/**
 * Rolagem suave global (Lenis) sincronizada com o GSAP ScrollTrigger.
 *
 * - Um único Lenis para a página inteira: os filmes e as cenas fixadas leem
 *   o progresso via ScrollTrigger, que é atualizado a cada evento do Lenis.
 * - No toque (iPhone/Android) o Lenis não suaviza: a rolagem nativa do Safari
 *   é a mais fluida que existe e o motor apenas a acompanha.
 * - Âncoras internas (a[href^="#"]) são delegadas ao Lenis.
 * - Com prefers-reduced-motion, nada disso liga: rolagem nativa pura.
 */

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
    // a barra do Safari aparecendo/sumindo não deve recalcular tudo
    ScrollTrigger.config({ ignoreMobileResize: true })
}

/** estado compartilhado da rolagem (lido pelos marquees e pelo cursor) */
export const rolagem = {
    direcao: 1 as 1 | -1,
    velocidade: 0,
    lenis: null as Lenis | null,
}

export function rolarPara(alvo: string | HTMLElement | number) {
    const el = typeof alvo === 'string' ? document.querySelector<HTMLElement>(alvo) : alvo
    if (el === null) return
    if (rolagem.lenis) {
        const destino =
            typeof el === 'number' ? el : el.getBoundingClientRect().top + window.scrollY
        const distancia = Math.abs(destino - window.scrollY)
        rolagem.lenis.scrollTo(destino, {
            duration: Math.min(2.8, 0.9 + distancia / 7000),
            easing: (t) => 1 - Math.pow(1 - t, 4),
        })
    } else if (typeof el === 'number') {
        window.scrollTo(0, el)
    } else {
        el.scrollIntoView()
    }
}

export default function SmoothScroll() {
    useEffect(() => {
        const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        let ultimoY = window.scrollY
        const aoRolarNativo = () => {
            const y = window.scrollY
            if (y !== ultimoY) rolagem.direcao = y > ultimoY ? 1 : -1
            rolagem.velocidade = y - ultimoY
            ultimoY = y
        }

        if (reduzido) {
            window.addEventListener('scroll', aoRolarNativo, { passive: true })
            return () => window.removeEventListener('scroll', aoRolarNativo)
        }

        const lenis = new Lenis({
            lerp: 0.085,
            wheelMultiplier: 0.95,
            smoothWheel: true,
            autoRaf: false,
        })
        rolagem.lenis = lenis

        lenis.on('scroll', (l: Lenis) => {
            if (l.direction === 1 || l.direction === -1) rolagem.direcao = l.direction
            rolagem.velocidade = l.velocity
            ScrollTrigger.update()
        })

        const tick = (time: number) => lenis.raf(time * 1000)
        gsap.ticker.add(tick)
        gsap.ticker.lagSmoothing(0)

        const aoClicar = (e: MouseEvent) => {
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return
            const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]')
            if (!a) return
            const href = a.getAttribute('href')!
            if (href === '#') return
            const el = document.querySelector<HTMLElement>(href)
            if (!el) return
            e.preventDefault()
            rolarPara(el)
            history.replaceState(null, '', href)
        }
        document.addEventListener('click', aoClicar)

        // fontes mudam alturas: recalcula depois que carregarem
        document.fonts?.ready.then(() => ScrollTrigger.refresh())

        // entrou com #ancora na URL
        if (location.hash) {
            const el = document.querySelector<HTMLElement>(location.hash)
            if (el) requestAnimationFrame(() => lenis.scrollTo(el, { immediate: true }))
        }

        return () => {
            document.removeEventListener('click', aoClicar)
            gsap.ticker.remove(tick)
            lenis.destroy()
            rolagem.lenis = null
        }
    }, [])

    return null
}
