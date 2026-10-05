'use client'

/**
 * Cursor customizado (só desktop com mouse). Ponto ácido + anel que segue com
 * atraso. Sobre links/botões o anel cresce; com data-cursor="TEXTO" mostra o
 * rótulo dentro dele.
 */

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function Cursor() {
    const pontoRef = useRef<HTMLDivElement>(null)
    const anelRef = useRef<HTMLDivElement>(null)
    const rotuloRef = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        const fino = window.matchMedia('(hover: hover) and (pointer: fine)').matches
        const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (!fino || reduzido) return
        const ponto = pontoRef.current!
        const anel = anelRef.current!
        const rotulo = rotuloRef.current!
        document.documentElement.classList.add('cursor-ativo')

        gsap.set([ponto, anel], { xPercent: -50, yPercent: -50, opacity: 0 })
        const px = gsap.quickTo(ponto, 'x', { duration: 0.08 })
        const py = gsap.quickTo(ponto, 'y', { duration: 0.08 })
        const ax = gsap.quickTo(anel, 'x', { duration: 0.45, ease: 'power3.out' })
        const ay = gsap.quickTo(anel, 'y', { duration: 0.45, ease: 'power3.out' })

        let visivel = false
        const mover = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse') return
            if (!visivel) {
                visivel = true
                gsap.set([ponto, anel], { x: e.clientX, y: e.clientY })
                gsap.to([ponto, anel], { opacity: 1, duration: 0.3 })
            }
            px(e.clientX)
            py(e.clientY)
            ax(e.clientX)
            ay(e.clientY)
        }
        const sobre = (e: PointerEvent) => {
            const alvo = (e.target as HTMLElement).closest<HTMLElement>('a, button, [data-cursor]')
            const texto = alvo?.dataset.cursor ?? ''
            rotulo.textContent = texto
            gsap.to(anel, {
                scale: alvo ? (texto ? 2.6 : 1.7) : 1,
                backgroundColor: texto ? 'rgba(215,255,31,1)' : 'rgba(215,255,31,0)',
                borderColor: alvo ? 'rgba(215,255,31,0.9)' : 'rgba(245,245,242,0.55)',
                duration: 0.35,
                ease: 'power3.out',
            })
            gsap.to(ponto, { scale: alvo ? 0 : 1, duration: 0.25 })
            gsap.to(rotulo, { opacity: texto ? 1 : 0, duration: 0.2 })
        }
        const sair = () => {
            visivel = false
            gsap.to([ponto, anel], { opacity: 0, duration: 0.3 })
        }
        const apertar = () => gsap.to(anel, { scale: '-=0.25', duration: 0.12, yoyo: true, repeat: 1 })

        window.addEventListener('pointermove', mover, { passive: true })
        document.addEventListener('pointerover', sobre)
        document.documentElement.addEventListener('pointerleave', sair)
        window.addEventListener('pointerdown', apertar)
        return () => {
            document.documentElement.classList.remove('cursor-ativo')
            window.removeEventListener('pointermove', mover)
            document.removeEventListener('pointerover', sobre)
            document.documentElement.removeEventListener('pointerleave', sair)
            window.removeEventListener('pointerdown', apertar)
        }
    }, [])

    return (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[80] hidden md:block">
            <div
                ref={anelRef}
                className="fixed left-0 top-0 grid h-10 w-10 place-items-center rounded-full border border-osso/55 opacity-0"
            >
                <span ref={rotuloRef} className="wide text-[5px] leading-none tracking-[0.12em] text-preto opacity-0" />
            </div>
            <div ref={pontoRef} className="fixed left-0 top-0 h-2 w-2 rounded-full bg-acido opacity-0 mix-blend-difference" />
        </div>
    )
}
