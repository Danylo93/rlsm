'use client'

/**
 * FilmeScroll — o motor do "filme interativo".
 *
 * Mesma filosofia do FilmeScroll do Agenda Brutal, generalizada:
 *  - seção alta (vh) com um palco sticky de 100dvh;
 *  - ScrollTrigger transforma a rolagem em progresso 0..1;
 *  - o progresso vira uma timeline de cenas (motor.ts) que o canvas desenha
 *    e que as camadas de texto (overlays) leem via barramento;
 *  - rolar para baixo avança, para cima volta; parar de rolar congela.
 *
 * Os textos são HTML de verdade (acessíveis, indexáveis); o canvas é decorativo.
 * Com prefers-reduced-motion vira uma sequência de seções estáticas com o
 * mesmo conteúdo.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import FilmeCanvas, { type FilmeCanvasApi } from './FilmeCanvas'
import LightLeak from './LightLeak'
import ScrollProgress from './ScrollProgress'
import { ContextoFilme, criarBarramento, useMovimentoReduzido } from './contexto'
import { calcularEstado, montarLinha, type CenaFilme, type EstadoFilme } from './motor'

export interface FilmeScrollProps {
    id: string
    /** nome acessível do filme */
    rotulo: string
    cenas: CenaFilme[]
    /** camada de texto de cada cena, pelo id da cena */
    camadas: Record<string, ReactNode>
    capitulos?: boolean
}

export default function FilmeScroll(props: FilmeScrollProps) {
    const reduzido = useMovimentoReduzido()
    return reduzido ? <FilmeEstatico {...props} /> : <FilmeCinematico {...props} />
}

/* ======================= versão cinematográfica ======================= */

function FilmeCinematico({ id, rotulo, cenas, camadas, capitulos = true }: FilmeScrollProps) {
    const linha = useMemo(() => montarLinha(cenas), [cenas])
    const barramento = useMemo(() => criarBarramento<EstadoFilme>(), [])
    const valor = useMemo(
        () => ({ modo: 'filme' as const, cenas, linha, inscrever: barramento.inscrever }),
        [cenas, linha, barramento]
    )
    const secaoRef = useRef<HTMLElement>(null)
    const apiRef = useRef<FilmeCanvasApi | null>(null)
    const sujoRef = useRef(true)
    const [pronto, setPronto] = useState(false)

    useEffect(() => {
        const secao = secaoRef.current!
        let p = 0
        let direcao: 1 | -1 = 1
        let visivel = true

        const st = ScrollTrigger.create({
            trigger: secao,
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
                p = self.progress
                direcao = self.direction === -1 ? -1 : 1
                sujoRef.current = true
            },
        })
        p = st.progress

        // fora da tela não desenha nada
        const vis = ScrollTrigger.create({
            trigger: secao,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self) => {
                visivel = self.isActive
                if (visivel) sujoRef.current = true
            },
        })
        visivel = vis.isActive || st.isActive

        const quadro = () => {
            if (!sujoRef.current || !visivel) return
            sujoRef.current = false
            const e = calcularEstado(cenas, linha, p, direcao)
            apiRef.current?.desenhar(e)
            barramento.emitir(e)
        }
        gsap.ticker.add(quadro)
        sujoRef.current = true
        quadro()

        return () => {
            gsap.ticker.remove(quadro)
            st.kill()
            vis.kill()
        }
    }, [cenas, linha, barramento])

    const primeiro = cenas[0]?.planos[0]

    return (
        <ContextoFilme.Provider value={valor}>
            <section
                ref={secaoRef}
                id={id}
                data-filme
                aria-label={rotulo}
                className="relative bg-preto"
                // altura de ROLAGEM em vh de propósito: vh não muda quando a barra
                // do Safari recolhe, então o filme não muda de tamanho no meio
                style={{ height: `${linha.total + 100}vh` }}
            >
                {/* âncoras de navegação caem no ponto certo de cada cena */}
                {cenas.map((c, i) =>
                    c.ancora ? (
                        <span
                            key={c.id}
                            id={c.ancora}
                            aria-hidden
                            className="pointer-events-none absolute left-0 h-px w-px"
                            style={{ top: `${linha.inicio[i] + (c.ancoraEm ?? 0) * c.vh}vh` }}
                        />
                    ) : null
                )}

                {/* palco: dvh, não vh — no Safari do iPhone 100vh é maior que a área visível */}
                <div className="sticky top-0 h-[100dvh] overflow-hidden">
                    {/* pôster: primeira pintura (LCP) enquanto o canvas não está pronto */}
                    {primeiro && (
                        <picture>
                            {primeiro.srcMobile && (
                                <source media="(max-aspect-ratio: 17/20)" srcSet={primeiro.srcMobile} />
                            )}
                            <img
                                src={primeiro.src}
                                alt=""
                                fetchPriority={id === 'filme' ? 'high' : 'low'}
                                loading={id === 'filme' ? 'eager' : 'lazy'}
                                className="absolute inset-0 h-full w-full scale-[1.14] object-cover brightness-[0.55]"
                            />
                        </picture>
                    )}

                    <FilmeCanvas
                        cenas={cenas}
                        linha={linha}
                        apiRef={apiRef}
                        pronto={pronto}
                        aoSujar={() => {
                            sujoRef.current = true
                        }}
                        aoPronto={() => setPronto(true)}
                    />

                    <LightLeak />

                    {/* camadas de texto: sem z-index no invólucro, para cada camada
                        poder ficar atrás (z-10) ou na frente (z-30) das pessoas */}
                    <div className="absolute inset-0">
                        {cenas.map((c) => (
                            <div key={c.id} className="contents">
                                {camadas[c.id]}
                            </div>
                        ))}
                    </div>

                    <ScrollProgress capitulos={capitulos} rotulo={`${String(cenas[0].numero).padStart(2, '0')} — ${cenas[0].capitulo}`} />
                </div>
            </section>
        </ContextoFilme.Provider>
    )
}

/* ======================= versão estática (reduced motion) ======================= */

const nada = () => () => {}

function FilmeEstatico({ id, rotulo, cenas, camadas }: FilmeScrollProps) {
    const linha = useMemo(() => montarLinha(cenas), [cenas])
    const valor = useMemo(() => ({ modo: 'estatico' as const, cenas, linha, inscrever: nada }), [cenas, linha])
    return (
        <ContextoFilme.Provider value={valor}>
            <section id={id} aria-label={rotulo} className="bg-preto">
                {cenas.map((c) => {
                    const pl = c.planos[0]
                    return (
                        <section
                            key={c.id}
                            id={c.ancora}
                            aria-label={c.capitulo}
                            className="relative flex min-h-[100svh] items-stretch overflow-hidden border-b border-osso/10"
                        >
                            {pl && (
                                <picture>
                                    {pl.srcMobile && <source media="(max-aspect-ratio: 17/20)" srcSet={pl.srcMobile} />}
                                            <img
                                        src={pl.src}
                                        alt=""
                                        loading="lazy"
                                        className="absolute inset-0 h-full w-full object-cover opacity-45"
                                    />
                                </picture>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-preto via-preto/30 to-preto/70" />
                            <div className="relative w-full">{camadas[c.id]}</div>
                        </section>
                    )
                })}
            </section>
        </ContextoFilme.Provider>
    )
}
