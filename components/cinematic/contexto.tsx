'use client'

/**
 * Barramento de progresso entre o motor e as camadas de texto.
 *
 * Nada aqui causa re-render por quadro: as cenas se inscrevem com uma função
 * que recebe o estado e escreve estilos direto nos elementos (refs). O React
 * só renderiza a estrutura uma vez.
 */

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CenaFilme, EstadoFilme, Linha } from './motor'

export type Modo = 'filme' | 'estatico'

/* useLayoutEffect sem aviso no servidor */
export const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/* ---------------- movimento reduzido ---------------- */

export function useMovimentoReduzido() {
    const [reduzido, setReduzido] = useState(false)
    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
        const aplicar = () => setReduzido(mq.matches)
        aplicar()
        mq.addEventListener('change', aplicar)
        return () => mq.removeEventListener('change', aplicar)
    }, [])
    return reduzido
}

/* ---------------- contexto do filme (canvas) ---------------- */

type Ouvinte = (e: EstadoFilme) => void

interface ContextoFilmeValor {
    modo: Modo
    cenas: CenaFilme[]
    linha: Linha
    inscrever: (fn: Ouvinte) => () => void
}

export const ContextoFilme = createContext<ContextoFilmeValor | null>(null)

/** 'filme' (padrão, inclusive no SSR) ou 'estatico' (prefers-reduced-motion) */
export function useModo(): Modo {
    const filme = useContext(ContextoFilme)
    const progresso = useContext(ContextoProgresso)
    return filme?.modo ?? progresso?.modo ?? 'filme'
}

/** Estilo inicial de algo que começa invisível no filme e aparece pela rolagem. */
export function useOculto() {
    return useModo() === 'filme' ? ESCONDIDO : undefined
}
const ESCONDIDO = { opacity: 0, visibility: 'hidden' } as const

/** Inscreve-se no estado bruto do filme. */
export function useFilme(fn: Ouvinte) {
    const ctx = useContext(ContextoFilme)
    const ref = useRef(fn)
    useIsoLayoutEffect(() => {
        ref.current = fn
    })
    useEffect(() => {
        if (!ctx || ctx.modo !== 'filme') return
        return ctx.inscrever((e) => ref.current(e))
    }, [ctx])
}

/**
 * Inscreve-se no progresso local de uma cena. Só chama `fn` enquanto a cena
 * está por perto (t entre -0.6 e 1.6); ao sair da faixa chama uma última vez
 * com o valor-limite, para o texto nunca ficar "preso" no meio do caminho
 * quando a pessoa rola rápido.
 */
export function useCena(id: string, fn: (t: number, e: EstadoFilme) => void) {
    const ctx = useContext(ContextoFilme)
    const indice = ctx ? ctx.cenas.findIndex((c) => c.id === id) : -1
    const dentro = useRef<boolean | null>(null)
    useFilme((e) => {
        if (indice < 0) return
        const t = e.t[indice]
        const perto = t > -0.6 && t < 1.6
        if (perto) {
            dentro.current = true
            fn(t, e)
        } else if (dentro.current !== false) {
            dentro.current = false
            fn(t < 0 ? -0.6 : 1.6, e)
        }
    })
}

/* ---------------- contexto de cena fixada (sem canvas) ---------------- */

interface ContextoProgressoValor {
    modo: Modo
    inscrever: (fn: (p: number) => void) => () => void
}

export const ContextoProgresso = createContext<ContextoProgressoValor | null>(null)

export function useProgresso(fn: (p: number) => void) {
    const ctx = useContext(ContextoProgresso)
    const ref = useRef(fn)
    useIsoLayoutEffect(() => {
        ref.current = fn
    })
    useEffect(() => {
        if (!ctx || ctx.modo !== 'filme') return
        return ctx.inscrever((p) => ref.current(p))
    }, [ctx])
}

/* ---------------- helpers de estilo ---------------- */

/** opacidade + visibilidade + clique, de uma vez */
export function mostrar(el: HTMLElement | null | undefined, a: number, clicavel = false) {
    if (!el) return
    el.style.opacity = a.toFixed(3)
    el.style.visibility = a <= 0.001 ? 'hidden' : 'visible'
    if (clicavel) el.style.pointerEvents = a > 0.6 ? 'auto' : 'none'
}

export function mover(el: HTMLElement | null | undefined, transform: string) {
    if (el) el.style.transform = transform
}

/** barramento de ouvintes; quem se inscreve recebe logo o último valor */
export function criarBarramento<T>() {
    const ouvintes = new Set<(v: T) => void>()
    let ultimo: T | undefined
    return {
        inscrever(fn: (v: T) => void) {
            ouvintes.add(fn)
            if (ultimo !== undefined) fn(ultimo)
            return () => {
                ouvintes.delete(fn)
            }
        },
        emitir(v: T) {
            ultimo = v
            ouvintes.forEach((fn) => fn(v))
        },
    }
}
