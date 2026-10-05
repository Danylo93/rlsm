'use client'

/**
 * Revelação ao entrar na tela para elementos com [data-revelar] fora do
 * filme. Um único IntersectionObserver para a página toda; o CSS faz a
 * transição (globals.css). Sem JS tudo fica visível (o estado escondido
 * só existe com html.js).
 */

import { useEffect } from 'react'

export default function Revelador() {
    useEffect(() => {
        const io = new IntersectionObserver(
            (entradas) => {
                for (const en of entradas) {
                    if (!en.isIntersecting) continue
                    ;(en.target as HTMLElement).dataset.visivel = '1'
                    io.unobserve(en.target)
                }
            },
            { rootMargin: '0px 0px -12% 0px' }
        )
        const observar = (raiz: ParentNode) =>
            raiz.querySelectorAll<HTMLElement>('[data-revelar]:not([data-visivel])').forEach((el) => io.observe(el))
        observar(document)
        const mo = new MutationObserver(() => observar(document))
        mo.observe(document.body, { childList: true, subtree: true })
        return () => {
            io.disconnect()
            mo.disconnect()
        }
    }, [])
    return null
}
