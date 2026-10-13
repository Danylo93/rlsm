'use client'

/**
 * CENA 08 — Próximos eventos. Composição editorial (nada de cards):
 * o próximo evento em destaque com data gigante, e o resto como um
 * "tracklist" — no hover a linha vira ácida e a foto segue o cursor.
 * Dados em data/eventos.ts.
 */

import Image from 'next/image'
import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import gsap from 'gsap'
import Botao from '@/components/ui/Botao'
import { Kicker } from '@/components/ui/Tipo'
import { diaSaoPaulo, eventoEncerrado, eventos, linkAgenda, partesData, proximosEventos, tiposEvento, type Evento } from '@/data/eventos'
import { linkWhatsApp, site } from '@/data/site'

// Atualiza a agenda mesmo se a página ficar aberta na virada do dia.
const inscreverDia = (avisar: () => void) => {
    const timer = window.setInterval(avisar, 30_000)
    window.addEventListener('focus', avisar)
    return () => {
        window.clearInterval(timer)
        window.removeEventListener('focus', avisar)
    }
}
const inicioDeHoje = () => diaSaoPaulo()
const diaNoServidor = () => ''

const linkEvento = (e: Evento) =>
    e.link ?? linkWhatsApp(`Oi! Eu vou no ${e.nome} (${partesData(e).curta})! Quero mais informações.`)

export default function Eventos() {
    const hoje = useSyncExternalStore(inscreverDia, inicioDeHoje, diaNoServidor)
    const lista = useMemo(() => hoje ? proximosEventos(eventos, new Date(`${hoje}T12:00:00-03:00`)) : [], [hoje])
    const encerrados = hoje ? eventos.filter((e) => eventoEncerrado(e, hoje)) : []

    const [destaque, ...resto] = lista

    return (
        <section id="eventos" aria-labelledby="titulo-eventos" className="campanha-laranja relative bg-preto px-4 py-28 sm:px-8 sm:py-40">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <Kicker className="mb-6">08 — Agenda</Kicker>
                    <h2 id="titulo-eventos" data-revelar className="display text-[clamp(48px,15.5vw,250px)] leading-[0.96]">
                        Vamos pro
                        <br />
                        <span className="texto-espectro">Next Level?</span>
                    </h2>
                </div>
                <p data-revelar className="ui-escala wide max-w-[24ch] text-[13px] leading-relaxed tracking-[0.08em] text-osso/70" style={{ '--atraso': '150ms' } as React.CSSProperties}>
                    Salva a data. Chama alguém. Bora junto.
                </p>
            </div>

            {hoje && (destaque ? <Destaque e={destaque} /> : <SemEventos />)}

            {resto.length > 0 && <Tracklist itens={resto} />}
            {encerrados.length > 0 && (
                <div className="mt-16 border-t border-osso/15 pt-8">
                    <h3 className="mono mb-5 text-[11px] text-osso/50">Já aconteceu</h3>
                    <ul>
                        {encerrados.map((e) => (
                            <li key={e.id} className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-b border-osso/15 py-5 text-osso/45">
                                <s className="display text-[clamp(28px,4vw,64px)] decoration-2">
                                    <time dateTime={e.data}>{partesData(e).curta}.{partesData(e).ano}</time>
                                    {' — '}{e.nome}
                                </s>
                                <span className="mono text-[10px]">Encerrado</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    )
}

function Destaque({ e }: { e: Evento }) {
    const d = partesData(e)
    return (
        <article className="mt-16 grid gap-10 border-t border-osso/15 pt-10 sm:mt-24 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
                <p className="mono mb-4 text-[11px] text-osso/50">Próximo</p>
                <p data-revelar className={`display ${e.dataFim ? 'text-[clamp(56px,8vw,140px)]' : 'text-[clamp(120px,19vw,320px)]'} leading-[0.78] tabular-nums text-acido`}>
                    <time dateTime={e.data}>
                        {e.dataFim ? `${d.dia}–${partesData({ ...e, data: e.dataFim, dataFim: undefined }).dia}` : d.dia}
                        <span className="text-osso/25">.</span>
                        {d.mes}
                    </time>
                </p>
                <p className="wide mt-5 text-[13px] tracking-[0.14em]">
                    {e.recorrencia ? 'Todos os sábados' : d.semana}
                    {e.hora && <> · {e.hora.replace(':', 'H')}</>} · {d.ano}
                </p>
            </div>

            <div className="flex flex-col gap-8 lg:col-span-7">
                {e.imagem && (
                    <figure data-revelar="imagem" className="relative aspect-[16/10] overflow-hidden bg-preto-3 sm:aspect-[16/9]">
                        <Image src={e.imagem} alt="" fill sizes="(max-width: 1024px) 100vw, 58vw" loading="lazy" className="object-cover grayscale-[35%]" />
                        <figcaption className="mono absolute left-3 top-3 bg-preto px-2 py-1 text-[10px]">
                            {tiposEvento[e.tipo]}
                        </figcaption>
                    </figure>
                )}
                <div>
                    <h3 data-revelar className="display corte-editorial text-[clamp(52px,7.5vw,128px)] leading-[0.98]">
                        {e.nome}
                    </h3>
                    <dl className="ui-escala mono mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-[11px]">
                        <dt className="texto-secundario">Local</dt>
                        <dd>
                            {e.local}
                            {e.endereco && <span className="texto-secundario"> — {e.endereco}</span>}
                        </dd>
                        <dt className="texto-secundario">Tipo</dt>
                        <dd>{tiposEvento[e.tipo]}</dd>
                    </dl>
                    {e.descricao && <p className="mt-5 max-w-[42ch] text-[17px] leading-snug text-osso/85 sm:text-lg 3xl:text-2xl">{e.descricao}</p>}
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Botao href={linkEvento(e)} cursor="EU VOU" tamanho="lg">
                            Eu vou
                        </Botao>
                        <Botao href={linkAgenda(e)} variante="contorno" icone="agenda" cursor="SALVAR">
                            Salvar na agenda
                        </Botao>
                    </div>
                </div>
            </div>
        </article>
    )
}

function Tracklist({ itens }: { itens: Evento[] }) {
    const previaRef = useRef<HTMLDivElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)
    const listaRef = useRef<HTMLOListElement>(null)

    useEffect(() => {
        const previa = previaRef.current
        const lista = listaRef.current
        if (!previa || !lista) return
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
        const xTo = gsap.quickTo(previa, 'x', { duration: 0.6, ease: 'power3.out' })
        const yTo = gsap.quickTo(previa, 'y', { duration: 0.6, ease: 'power3.out' })
        let aguardarMovimento = false
        const mover = (ev: PointerEvent) => {
            if (aguardarMovimento) {
                aguardarMovimento = false
                entrar(ev)
            }
            xTo(ev.clientX)
            yTo(ev.clientY)
        }
        const sair = () => gsap.to(previa, { clipPath: 'inset(100% 0 0 0)', opacity: 0, duration: 0.2, overwrite: true })
        const entrar = (ev: PointerEvent) => {
            if (aguardarMovimento) return
            const li = (ev.target as HTMLElement).closest<HTMLElement>('[data-imagem]')
            if (!li || !imgRef.current) {
                sair()
                return
            }
            const src = li.dataset.imagem!
            if (imgRef.current.getAttribute('src') !== src) imgRef.current.src = src
            gsap.to(previa, { clipPath: 'inset(0% 0 0 0)', opacity: 1, rotate: li.dataset.rot, duration: 0.5, ease: 'expo.out', overwrite: true })
        }
        const aoRolar = () => {
            aguardarMovimento = true
            sair()
        }
        const sairDaLinha = (ev: PointerEvent) => {
            const linha = (ev.target as HTMLElement).closest('[data-imagem]')
            if (linha && ev.relatedTarget instanceof Node && linha.contains(ev.relatedTarget)) return
            sair()
        }
        gsap.set(previa, { xPercent: -50, yPercent: -60, clipPath: 'inset(100% 0 0 0)', opacity: 0 })
        lista.addEventListener('pointermove', mover)
        lista.addEventListener('pointerover', entrar)
        lista.addEventListener('pointerleave', sair)
        lista.addEventListener('pointerout', sairDaLinha)
        window.addEventListener('scroll', aoRolar, true)
        window.addEventListener('blur', sair)
        return () => {
            lista.removeEventListener('pointermove', mover)
            lista.removeEventListener('pointerover', entrar)
            lista.removeEventListener('pointerleave', sair)
            lista.removeEventListener('pointerout', sairDaLinha)
            window.removeEventListener('scroll', aoRolar, true)
            window.removeEventListener('blur', sair)
            xTo.tween.kill()
            yTo.tween.kill()
            gsap.killTweensOf(previa)
        }
    }, [])

    return (
        <div className="mt-24 sm:mt-32">
            <div className="ui-escala mono hidden grid-cols-[200px_1fr_200px_200px_48px] gap-4 border-b border-osso/15 pb-3 text-[10px] text-osso/40 lg:grid">
                <span>Data</span>
                <span>Evento</span>
                <span>Tipo</span>
                <span>Local</span>
                <span />
            </div>
            <ol ref={listaRef}>
                {itens.map((e, i) => {
                    const d = partesData(e)
                    return (
                        <li key={e.id} data-imagem={e.imagem} data-rot={i % 2 ? '3' : '-3'}>
                            <a
                                href={linkEvento(e)}
                                target="_blank"
                                rel="noopener noreferrer"
                                data-cursor="EU VOU"
                                className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 border-b border-osso/15 py-5 sm:py-7 lg:grid-cols-[200px_1fr_200px_200px_48px]"
                            >
                                <span
                                    aria-hidden
                                    className="absolute inset-0 origin-bottom scale-y-0 bg-acido transition-transform duration-500 ease-[var(--ease-filme)] group-hover:scale-y-100 group-focus-visible:scale-y-100"
                                />
                                <time dateTime={e.data} className="display relative text-[clamp(28px,3.4vw,54px)] tabular-nums text-acido transition-colors duration-300 group-hover:text-preto">
                                    {e.recorrencia ? 'Sábados' : d.curta}
                                </time>
                                <span className="display relative text-[clamp(30px,4.6vw,78px)] leading-[0.9] transition-colors duration-300 group-hover:text-preto">
                                    {e.nome}
                                </span>
                                <span className="mono relative col-start-2 text-[10px] text-osso/55 transition-colors group-hover:text-preto/70 lg:col-start-auto lg:text-[11px]">
                                    {tiposEvento[e.tipo]} <span className="lg:hidden">· {e.local}</span>
                                </span>
                                <span className="mono relative hidden text-[11px] text-osso/70 transition-colors group-hover:text-preto lg:block">
                                    {e.local}
                                </span>
                                <span
                                    aria-hidden
                                    className="relative col-start-3 row-span-2 row-start-1 grid h-10 w-10 place-items-center border border-osso/25 transition-all duration-500 group-hover:rotate-45 group-hover:border-preto group-hover:bg-preto group-hover:text-acido lg:col-start-auto lg:row-span-1"
                                >
                                    ↗
                                </span>
                            </a>
                        </li>
                    )
                })}
            </ol>

            {/* prévia que segue o cursor (desktop) */}
            <div
                ref={previaRef}
                aria-hidden
                className="pointer-events-none fixed left-0 top-0 z-40 hidden w-[min(22vw,320px)] md:block"
                style={{ opacity: 0 }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img ref={imgRef} alt="" className="aspect-[4/5] w-full object-cover" />
            </div>
        </div>
    )
}

function SemEventos() {
    return (
        <div className="mt-16 border-t border-osso/15 pt-10">
            <p className="display text-[clamp(44px,6vw,96px)] leading-[0.9]">Novos movimentos chegando.</p>
            <p className="mt-4 max-w-[40ch] text-lg text-osso/70">
                Fica de olho {site.instagram ? 'no nosso Instagram' : 'por aqui'} — ou chama a gente no WhatsApp pra saber primeiro.
            </p>
        </div>
    )
}
