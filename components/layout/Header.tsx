'use client'

/**
 * Cabeçalho minimalista. Transparente sobre a abertura; depois dela ganha
 * preto translúcido com blur discreto. No mobile abre o menu em tela cheia.
 */

import { useCallback, useEffect, useState } from 'react'
import Logo from '@/components/ui/Logo'
import MobileMenu from './MobileMenu'
import { menu } from '@/data/site'

export default function Header() {
    const [solido, setSolido] = useState(false)
    const [aberto, setAberto] = useState(false)
    const fechar = useCallback(() => setAberto(false), [])

    useEffect(() => {
        const ver = () => setSolido(window.scrollY > window.innerHeight * 0.7)
        ver()
        window.addEventListener('scroll', ver, { passive: true })
        return () => window.removeEventListener('scroll', ver)
    }, [])

    return (
        <>
            <header
                className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-500 ${
                    solido ? 'border-osso/10 bg-preto/70 backdrop-blur-md' : 'border-transparent bg-transparent'
                }`}
            >
                <div className="flex h-[var(--cabecalho)] items-center justify-between px-4 sm:px-8">
                    <a href="#inicio" aria-label="Radicais Livres São Miguel — voltar ao início" data-cursor="TOPO" className="ui-escala">
                        <Logo />
                    </a>

                    <nav aria-label="Principal" className="ui-escala hidden lg:block">
                        <ul className="flex items-center gap-6 xl:gap-8">
                            {menu.slice(0, 5).map((l) => (
                                <li key={l.href}>
                                    <a href={l.href} className="wide group relative block text-[11px] tracking-[0.14em] text-osso/80 hover:text-osso">
                                        <span className="rolar">
                                            <span>{l.rotulo}</span>
                                            <span aria-hidden className="text-acido">
                                                {l.rotulo}
                                            </span>
                                        </span>
                                        <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-acido transition-transform duration-500 group-hover:scale-x-100" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="ui-escala flex items-center gap-2">
                        <a
                            href="#fazer-parte"
                            className="wide hidden h-10 items-center bg-acido px-4 text-[11px] tracking-[0.1em] text-preto transition-colors hover:bg-osso baixo:h-9 sm:inline-flex"
                        >
                            <span className="rolar">
                                <span>Fazer parte</span>
                                <span aria-hidden>Fazer parte</span>
                            </span>
                        </a>
                        <button
                            type="button"
                            onClick={() => setAberto(true)}
                            aria-expanded={aberto}
                            aria-controls="menu-mobile"
                            className="wide flex h-11 items-center gap-3 pl-3 text-[11px] tracking-[0.16em] lg:hidden"
                        >
                            Menu
                            <span aria-hidden className="flex w-7 flex-col gap-[5px]">
                                <span className="h-[2px] w-full bg-osso" />
                                <span className="h-[2px] w-2/3 self-end bg-acido" />
                            </span>
                        </button>
                    </div>
                </div>
            </header>
            <MobileMenu aberto={aberto} aoFechar={fechar} />
        </>
    )
}
