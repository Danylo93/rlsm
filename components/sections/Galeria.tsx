'use client'

/**
 * CENA 09 — Galeria. Um mural que se monta com a rolagem: fotos chegam de
 * fora da tela girando, umas por trás e outras pela frente de ISSO É FAMÍLIA.
 * Bordas de foto impressa, fita adesiva, rotações tortas — de propósito.
 */

import { useEffect, useRef, useState } from 'react'
import Cena from '@/components/cinematic/Cena'
import { mostrar, mover, useModo, useOculto, useProgresso } from '@/components/cinematic/contexto'
import { faixa, janela, lerp } from '@/components/cinematic/motor'
import { Kicker } from '@/components/ui/Tipo'
import { galeria, type FotoGaleria } from '@/data/galeria'

const PALAVRAS = [
    { txt: 'Isso', j: [0.03, 0.12] },
    { txt: 'é', j: [0.22, 0.31] },
    { txt: 'família.', j: [0.44, 0.56] },
] as const

function Foto({ f, i, estatico, fRef }: { f: FotoGaleria; i: number; estatico: boolean; fRef: (el: HTMLElement | null) => void }) {
    const oculto = useOculto()
    return (
        <figure
            ref={fRef}
            data-anim
            style={
                estatico
                    ? { transform: `rotate(${f.r}deg)` }
                    : { ...oculto, width: `min(${f.w}vw, ${(f.w * 1.25).toFixed(1)}vh)`, transform: 'translate3d(-50%,-50%,0)' }
            }
            className={`bg-osso p-[clamp(5px,0.55vw,9px)] pb-[clamp(22px,2.2vw,34px)] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.85)] ${
                estatico ? 'relative w-[44%] sm:w-[30%]' : `absolute left-1/2 top-1/2 ${f.camada === 'frente' ? 'z-30' : 'z-10'}`
            }`}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={f.src}
                alt={f.alt}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full object-cover [filter:contrast(1.05)_saturate(0.9)]"
            />
            {f.legenda && (
                <figcaption className="mono absolute bottom-[clamp(5px,0.6vw,10px)] left-[clamp(6px,0.6vw,10px)] text-[clamp(8px,0.62vw,10px)] text-preto/70">
                    {f.legenda} — {String(i + 1).padStart(3, '0')}
                </figcaption>
            )}
            {f.fita && (
                <span
                    aria-hidden
                    className="absolute -top-3 left-1/2 h-6 w-[38%] -translate-x-1/2 bg-[#efe9d8]/75 shadow-sm"
                    style={{ rotate: `${i % 2 ? 4 : -5}deg` }}
                />
            )}
        </figure>
    )
}

function Mural() {
    const filme = useModo() === 'filme'
    const oculto = useOculto()
    const fotosRef = useRef<Array<HTMLElement | null>>([])
    const palavrasRef = useRef<Array<HTMLSpanElement | null>>([])
    const [mobile, setMobile] = useState(false)
    const mobileRef = useRef(false)

    useEffect(() => {
        const mq = window.matchMedia('(max-width: 767px)')
        const aplicar = () => {
            mobileRef.current = mq.matches
            setMobile(mq.matches)
        }
        aplicar()
        mq.addEventListener('change', aplicar)
        return () => mq.removeEventListener('change', aplicar)
    }, [])

    useProgresso((p) => {
        const m = mobileRef.current
        galeria.forEach((f, i) => {
            const el = fotosRef.current[i]
            if (!el) return
            const [a, b] = f.entra
            const k = janela(p, a, b)
            const pos = m ? f.m : f
            // chegou: flutua um pouco (as da frente mais — profundidade)
            const deriva = (p - b) * (f.camada === 'frente' ? -9 : -4)
            const x = pos.x + lerp(f.de[0], 0, k)
            const y = pos.y + lerp(f.de[1], 0, k) + (k >= 1 ? deriva : 0)
            const rot = f.r + (1 - k) * (i % 2 ? 22 : -18)
            const s = lerp(1.3, 1, k)
            // pela menor medida: em tela baixa/larga as fotos não engolem a frase
            el.style.width = m ? `min(${f.m.w}vw, ${(f.m.w * 0.5).toFixed(1)}vh)` : `min(${f.w}vw, ${(f.w * 1.25).toFixed(1)}vh)`
            mover(
                el,
                `translate3d(calc(-50% + ${x.toFixed(2)}vw), calc(-50% + ${y.toFixed(2)}vh), 0) rotate(${rot.toFixed(2)}deg) scale(${s.toFixed(3)})`
            )
            mostrar(el, faixa(p, a, a + 0.025))
        })
        PALAVRAS.forEach((w, i) => {
            const el = palavrasRef.current[i]
            const k = janela(p, w.j[0], w.j[1])
            mostrar(el, k)
            mover(el, `translate3d(0, ${((1 - k) * 40).toFixed(1)}%, 0)`)
            if (el) el.style.letterSpacing = `${lerp(0.2, -0.01, k).toFixed(4)}em`
        })
    })

    if (!filme) {
        return (
            <div className="px-4 py-28 sm:px-8">
                <Kicker className="mb-6">09 — Galeria</Kicker>
                <h2 className="display text-[min(22vw,30dvh)] leading-[0.82]">
                    Isso é <span className="text-acido">família.</span>
                </h2>
                <div className="mt-14 flex flex-wrap justify-center gap-6">
                    {galeria.map((f, i) => (
                        <Foto key={f.src} f={f} i={i} estatico fRef={() => {}} />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="absolute inset-0" data-mobile={mobile ? '1' : '0'}>
            <div className="absolute inset-x-0 top-[calc(var(--cabecalho)+16px)] z-40 flex justify-between px-4 sm:px-8">
                <Kicker>09 — Galeria</Kicker>
                <span className="mono hidden text-[11px] text-osso/50 sm:block">Fotos reais. Gente real.</span>
            </div>

            {galeria.map((f, i) => (
                <Foto
                    key={f.src}
                    f={f}
                    i={i}
                    estatico={false}
                    fRef={(el) => {
                        fotosRef.current[i] = el
                    }}
                />
            ))}

            {/* no celular a frase fica na frente de todas as fotos: a tela é estreita
                demais para o mural não cobrir a palavra */}
            <h2 className="display pointer-events-none absolute inset-0 z-20 flex max-md:z-40 max-md:[text-shadow:0_4px_28px_rgba(8,8,8,0.9)] flex-col items-center justify-center pt-[var(--cabecalho)] text-center text-[min(24vw,15dvh)] leading-[0.84] baixo:text-[22dvh] sm:text-[min(15vw,26dvh)]">
                {PALAVRAS.map((w, i) => (
                    <span
                        key={w.txt}
                        ref={(el) => {
                            palavrasRef.current[i] = el
                        }}
                        data-anim
                        style={oculto}
                        className={`block sombra-filme ${i === 2 ? 'text-acido' : ''}`}
                    >
                        {w.txt}
                    </span>
                ))}
            </h2>
        </div>
    )
}

export default function Galeria() {
    return (
        <Cena id="galeria" rotulo="Galeria" alturaVh={400} className="bg-preto">
            <Mural />
        </Cena>
    )
}
