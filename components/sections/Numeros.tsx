'use client'

/**
 * CENA 07 — Números. Quebra visual: fundo quase preto, um trilho horizontal
 * que a rolagem vertical empurra. Cada número é um contorno que se enche de
 * ácido quando chega ao centro; números contam, palavras se "desembaralham".
 */

import { useRef } from 'react'
import Cena from '@/components/cinematic/Cena'
import { mover, useModo, useProgresso } from '@/components/cinematic/contexto'
import { faixa, janela } from '@/components/cinematic/motor'
import { Kicker } from '@/components/ui/Tipo'
import { numeros, type Numero } from '@/data/cenas'

const LETRAS = 'ABCDEFGHIJKLMNOPRSTUVWXZ'

function texto(n: Numero, enchido: number, semente: number) {
    if (typeof n.valor === 'number') {
        return String(Math.round(n.valor * enchido)).padStart(n.digitos ?? 1, '0')
    }
    const alvo = n.valor.toUpperCase()
    const fixas = Math.floor(alvo.length * enchido)
    let s = alvo.slice(0, fixas)
    for (let i = fixas; i < alvo.length; i++) {
        const x = Math.sin((semente + i) * 91.7) * 10000
        s += alvo[i] === ' ' || alvo[i] === '.' ? alvo[i] : LETRAS[Math.floor((x - Math.floor(x)) * LETRAS.length)]
    }
    return s
}

function valorFinal(n: Numero) {
    return typeof n.valor === 'number' ? String(n.valor).padStart(n.digitos ?? 1, '0') : n.valor
}

function Trilho() {
    const filme = useModo() === 'filme'
    const trilhoRef = useRef<HTMLDivElement>(null)
    const cheioRef = useRef<Array<HTMLSpanElement | null>>([])
    const baseRef = useRef<Array<HTMLSpanElement | null>>([])
    const contadorRef = useRef<HTMLSpanElement>(null)
    const barraRef = useRef<HTMLSpanElement>(null)
    const n = numeros.length

    useProgresso((p) => {
        const trilho = trilhoRef.current
        if (!trilho) return
        const k = faixa(p, 0.06, 0.94)
        const sobra = trilho.scrollWidth - window.innerWidth
        mover(trilho, `translate3d(${(-k * sobra).toFixed(1)}px, 0, 0)`)
        if (barraRef.current) barraRef.current.style.transform = `scaleX(${k.toFixed(4)})`
        let ativo = 0
        numeros.forEach((num, i) => {
            const centro = i / (n - 1)
            const enchido = i === 0 ? janela(k, -0.2, 0.05) : janela(k, centro - 0.24, centro - 0.02)
            if (enchido > 0.5) ativo = i
            const cheio = cheioRef.current[i]
            if (cheio) {
                // topo negativo: o preenchimento cobre também acentos acima da caixa (Á)
                cheio.style.clipPath = `inset(${(100 - enchido * 130).toFixed(2)}% -5% -15% -5%)`
                const txt = texto(num, enchido, Math.floor(p * 160) + i * 7)
                cheio.textContent = txt
                if (baseRef.current[i]) baseRef.current[i]!.textContent = txt
            }
        })
        if (contadorRef.current) contadorRef.current.textContent = `${String(ativo + 1).padStart(2, '0')}/${String(n).padStart(2, '0')}`
    })

    return (
        <div className={filme ? 'absolute inset-0' : 'relative py-28'}>
            <div
                className={`flex items-center justify-between gap-4 px-4 sm:px-8 ${filme ? 'absolute inset-x-0 top-[calc(var(--cabecalho)+16px)] z-10' : 'mb-12'}`}
            >
                <Kicker>07 — Em números (que não cabem em números)</Kicker>
                {filme && (
                    <span ref={contadorRef} className="mono text-[11px] tabular-nums text-osso/60">
                        01/{String(n).padStart(2, '0')}
                    </span>
                )}
            </div>

            <div
                ref={trilhoRef}
                data-anim
                className={filme ? 'flex h-full w-max items-stretch' : 'flex flex-col'}
            >
                {numeros.map((num, i) => (
                    <article
                        key={num.rotulo}
                        className={`relative flex shrink-0 flex-col justify-center px-4 sm:px-8 lg:px-16 ${
                            filme ? 'h-full w-screen lg:w-[78vw]' : 'min-h-[70svh] py-16'
                        } ${num.destaque ? 'bg-acido text-preto' : ''}`}
                    >
                        <span className={`mono mb-4 text-[11px] ${num.destaque ? 'text-preto/60' : 'text-osso/40'}`}>
                            {String(i + 1).padStart(2, '0')}
                        </span>
                        <p
                            className="display relative whitespace-nowrap text-[min(30vw,40dvh)] leading-[0.8] lg:text-[min(22vw,44dvh)]"
                            aria-label={valorFinal(num)}
                        >
                            {/* contorno (base) + preenchimento que sobe com a rolagem */}
                            <span
                                ref={(el) => { baseRef.current[i] = el }}
                                aria-hidden
                                className={num.destaque ? 'contorno-preto' : 'contorno'}
                            >
                                {valorFinal(num)}
                            </span>
                            <span
                                ref={(el) => { cheioRef.current[i] = el }}
                                aria-hidden
                                className={`absolute inset-0 ${num.destaque ? 'text-preto' : 'text-acido'}`}
                                style={{ clipPath: filme ? 'inset(100% 0 0 0)' : undefined }}
                            >
                                {valorFinal(num)}
                            </span>
                        </p>
                        <h3 className="wide mt-6 text-[clamp(20px,2.6vw,38px)] tracking-[0.06em]">{num.rotulo}</h3>
                        <p className={`mt-3 max-w-[32ch] text-[16px] leading-snug sm:text-lg 3xl:text-2xl ${num.destaque ? 'text-preto/75' : 'text-osso/70'}`}>
                            {num.texto}
                        </p>
                    </article>
                ))}
            </div>

            {filme && (
                <div aria-hidden className="absolute bottom-8 left-4 right-4 h-px bg-osso/15 sm:left-8 sm:right-8">
                    <span ref={barraRef} className="absolute inset-0 origin-left bg-acido" style={{ transform: 'scaleX(0)' }} />
                </div>
            )}
        </div>
    )
}

export default function Numeros() {
    return (
        <Cena id="numeros" rotulo="Em números" alturaVh={420} className="bg-preto-2">
            <Trilho />
        </Cena>
    )
}
