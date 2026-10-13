import Botao from '@/components/ui/Botao'
import { Estrela } from '@/components/ui/Marquee'
import { ctas, menu, site } from '@/data/site'

export default function Footer() {
    const redes = [
        { rotulo: 'Instagram', href: site.instagram },
        { rotulo: 'YouTube', href: site.youtube },
        { rotulo: 'WhatsApp', href: ctas.falar },
    ].filter((r) => r.href)

    return (
        <footer className="relative overflow-hidden bg-preto pt-24 sm:pt-32">
            <div className="px-4 sm:px-8">
                <p className="mono mb-6 flex items-center gap-2 text-[11px] text-osso/50">
                    <Estrela className="text-acido" /> Fim do filme. Começo da história.
                </p>
                <p className="display text-[clamp(56px,10.5vw,190px)] leading-[0.92]">
                    Nós Ainda não Vivemos
                    <br />
                    <span className="text-acido">Tudo</span>
                </p>

                <div className="ui-escala mt-16 grid gap-10 border-t border-osso/15 pt-10 sm:mt-24 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_0.7fr_auto] xl:gap-14">
                    <div>
                        <h2 className="mono mb-4 text-[11px] text-osso/40">Onde</h2>
                        <p className="wide text-[13px] leading-relaxed">{site.igreja}</p>
                        {site.endereco && <p className="mt-2 text-sm text-osso/60">{site.endereco}</p>}
                        {site.mapa && (
                            <a href={site.mapa} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-acido underline-offset-4 hover:underline">
                                Abrir no mapa ↗
                            </a>
                        )}
                    </div>
                    <nav aria-label="Rodapé">
                        <h2 className="mono mb-4 text-[11px] text-osso/40">Navegue</h2>
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {menu.map((l) => (
                                <li key={l.href}>
                                    <a href={l.href} className="wide text-[12px] tracking-[0.1em] text-osso/80 transition-colors hover:text-acido">
                                        {l.rotulo}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <div>
                        <h2 className="mono mb-4 text-[11px] text-osso/40">Siga</h2>
                        <ul className="flex flex-col gap-2">
                            {redes.map((r) => (
                                <li key={r.rotulo}>
                                    <a
                                        href={r.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="wide text-[12px] tracking-[0.1em] text-osso/80 transition-colors hover:text-acido"
                                    >
                                        {r.rotulo} ↗
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h2 className="mono mb-4 text-[11px] text-osso/40">Fala com a gente</h2>
                        <Botao href={ctas.falar} icone="whatsapp" variante="claro" cursor="BORA">
                            Chamar no WhatsApp
                        </Botao>
                    </div>
                </div>
            </div>

            {/* assinatura gigante */}
            <div aria-hidden className="mt-20 select-none sm:mt-28">
                <p className="display whitespace-nowrap text-center text-[15.2vw] leading-[0.78]">Radicais Livres</p>
                <p className="display contorno mt-[0.1em] whitespace-nowrap text-center text-[15.2vw] leading-[0.86] opacity-60">São Miguel</p>
            </div>

            <div className="mono flex flex-col gap-3 border-t border-osso/10 px-4 py-6 text-[10px] text-osso/45 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <p>
                    © {new Date().getFullYear()} {site.nome} · {site.igreja}
                </p>
                <a href="#inicio" className="text-osso/70 transition-colors hover:text-acido">
                    ↑ Rebobinar o filme
                </a>
            </div>
        </footer>
    )
}
