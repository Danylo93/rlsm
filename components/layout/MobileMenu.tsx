'use client'

/**
 * Menu em tela cheia (mobile/tablet). Abre como uma cortina de cima para
 * baixo; os links sobem em sequência, gigantes. Trava a rolagem enquanto aberto.
 */

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import Logo from '@/components/ui/Logo'
import { Estrela } from '@/components/ui/Marquee'
import { rolagem } from '@/components/cinematic/SmoothScroll'
import { ctas, menu, site } from '@/data/site'

export default function MobileMenu({ aberto, aoFechar }: { aberto: boolean; aoFechar: () => void }) {
    const painelRef = useRef<HTMLDivElement>(null)
    const linksRef = useRef<Array<HTMLAnchorElement | null>>([])
    const fecharRef = useRef<HTMLButtonElement>(null)
    const montado = useRef(false)

    useEffect(() => {
        const painel = painelRef.current!
        const links = linksRef.current.filter(Boolean)
        const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const dur = reduzido ? 0 : 1

        if (aberto) {
            rolagem.lenis?.stop()
            document.body.style.overflow = 'hidden'
            painel.removeAttribute('inert')
            gsap.set(painel, { visibility: 'visible' })
            gsap.timeline()
                .fromTo(painel, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.7 * dur, ease: 'expo.inOut' })
                .fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 0.8 * dur, stagger: 0.06 * dur, ease: 'expo.out' }, '-=0.25')
            fecharRef.current?.focus()
            const esc = (e: KeyboardEvent) => {
                if (e.key === 'Escape') aoFechar()
            }
            window.addEventListener('keydown', esc)
            return () => window.removeEventListener('keydown', esc)
        }

        if (!montado.current) {
            montado.current = true
            return
        }
        rolagem.lenis?.start()
        document.body.style.overflow = ''
        painel.setAttribute('inert', '')
        gsap.to(painel, {
            clipPath: 'inset(100% 0 0% 0)',
            duration: 0.6 * dur,
            ease: 'expo.inOut',
            onComplete: () => {
                gsap.set(painel, { visibility: 'hidden' })
            },
        })
    }, [aberto, aoFechar])

    return (
        <div
            ref={painelRef}
            id="menu-mobile"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            // fechado desde o SSR: invisível e inerte
            inert
            style={{ visibility: 'hidden', clipPath: 'inset(0 0 100% 0)' }}
            className="campanha-clara fixed inset-0 z-[55] flex flex-col bg-preto"
            onClick={(e) => {
                if ((e.target as HTMLElement).closest('a')) aoFechar()
            }}
        >
            <div className="flex h-[var(--cabecalho)] shrink-0 items-center justify-between px-4 sm:px-8">
                <Logo className="campanha-logo" />
                <button
                    ref={fecharRef}
                    type="button"
                    onClick={aoFechar}
                    className="wide flex h-11 items-center gap-3 pl-3 text-[11px] tracking-[0.16em]"
                >
                    Fechar
                    <span aria-hidden className="relative h-5 w-5">
                        <span className="absolute left-0 top-1/2 h-[2px] w-full rotate-45 bg-acido" />
                        <span className="absolute left-0 top-1/2 h-[2px] w-full -rotate-45 bg-osso" />
                    </span>
                </button>
            </div>

            <nav aria-label="Menu principal" className="flex flex-1 flex-col justify-center px-4 sm:px-8">
                <ol className="flex flex-col">
                    {menu.map((l, i) => (
                        <li key={l.href} className="mascara border-b border-osso/10">
                            <a
                                ref={(el) => {
                                    linksRef.current[i] = el
                                }}
                                href={l.href}
                                className="group flex items-baseline justify-between py-1.5"
                            >
                                <span className="display text-[clamp(52px,15vw,120px)] leading-[0.92] transition-colors group-hover:text-acido group-active:text-acido">
                                    {l.rotulo}
                                </span>
                                <span className="mono text-[11px] text-osso/40">{String(i + 1).padStart(2, '0')}</span>
                            </a>
                        </li>
                    ))}
                </ol>
            </nav>

            <div className="flex shrink-0 items-center justify-between gap-4 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 sm:px-8">
                <p className="mono flex items-center gap-2 text-[10px] text-osso/50">
                    <Estrela className="text-acido" /> {site.lema}
                </p>
                <a href={ctas.falar} target="_blank" rel="noopener noreferrer" className="wide text-[11px] tracking-[0.12em] text-acido">
                    WhatsApp ↗
                </a>
            </div>
        </div>
    )
}
