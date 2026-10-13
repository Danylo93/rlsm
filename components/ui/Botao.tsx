'use client'

/**
 * Botão magnético. Bloco de texto + bloco de seta, estilo etiqueta de
 * streetwear. O texto rola no hover; com mouse, o botão é "puxado" pelo cursor.
 */

import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'

type Variante = 'acido' | 'claro' | 'contorno'
type Icone = 'seta' | 'whatsapp' | 'agenda'

interface Props {
    href: string
    children: string
    variante?: Variante
    icone?: Icone
    externo?: boolean
    tamanho?: 'md' | 'lg'
    className?: string
    /** rótulo que aparece no cursor customizado */
    cursor?: string
    style?: React.CSSProperties
}

const corpo: Record<Variante, string> = {
    acido: 'botao-principal text-preto',
    claro: 'bg-osso text-preto',
    contorno: 'bg-preto/30 text-osso ring-1 ring-inset ring-osso/60 backdrop-blur-sm',
}
const caixa: Record<Variante, string> = {
    acido: 'bg-preto text-acido ring-2 ring-inset ring-acido group-hover:bg-brasa group-hover:text-preto group-hover:ring-brasa',
    claro: 'bg-preto text-osso ring-2 ring-inset ring-osso group-hover:bg-acido group-hover:text-preto group-hover:ring-acido',
    contorno: 'bg-osso text-preto group-hover:bg-acido',
}

export function IconeBotao({ icone, className = '' }: { icone: Icone; className?: string }): ReactNode {
    if (icone === 'whatsapp')
        return (
            <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.3Z" />
            </svg>
        )
    if (icone === 'agenda')
        return (
            <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="5" width="18" height="16" />
                <path d="M3 10h18M8 3v4M16 3v4" />
            </svg>
        )
    return (
        <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M6 18 18 6M8 6h10v10" strokeLinecap="square" />
        </svg>
    )
}

export default function Botao({
    href,
    children,
    variante = 'acido',
    icone = 'seta',
    externo,
    tamanho = 'md',
    className = '',
    cursor,
    style,
}: Props) {
    const ref = useRef<HTMLAnchorElement>(null)
    const ehExterno = externo ?? /^https?:/.test(href)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
        const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })
        const mover = (e: PointerEvent) => {
            const r = el.getBoundingClientRect()
            xTo((e.clientX - (r.left + r.width / 2)) * 0.22)
            yTo((e.clientY - (r.top + r.height / 2)) * 0.32)
        }
        const sair = () => {
            gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' })
        }
        el.addEventListener('pointermove', mover)
        el.addEventListener('pointerleave', sair)
        return () => {
            el.removeEventListener('pointermove', mover)
            el.removeEventListener('pointerleave', sair)
        }
    }, [])

    const altura = tamanho === 'lg' ? 'h-16 sm:h-[68px] baixo:h-12' : 'h-14 sm:h-[58px] baixo:h-11'

    return (
        <a
            ref={ref}
            href={href}
            {...(ehExterno ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            data-cursor={cursor}
            style={style}
            className={`botao-etiqueta ui-escala group wide inline-flex select-none items-stretch text-[12px] leading-none tracking-[0.06em] sm:text-[13px] ${className}`}
        >
            <span className={`flex items-center whitespace-nowrap px-5 sm:px-6 ${altura} ${corpo[variante]}`}>
                <span className="rolar">
                    <span>{children}</span>
                    <span aria-hidden>{children}</span>
                </span>
            </span>
            <span
                className={`grid aspect-square place-items-center transition-colors duration-300 ${altura} ${caixa[variante]}`}
            >
                <IconeBotao
                    icone={icone}
                    className={`h-5 w-5 transition-transform duration-500 ease-[var(--ease-filme)] ${icone === 'seta' ? 'group-hover:rotate-45' : 'group-hover:scale-110'}`}
                />
            </span>
        </a>
    )
}
