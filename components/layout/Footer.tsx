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
        <footer className="campanha-azul relative overflow-hidden bg-preto pt-24 sm:pt-32">
            <div className="px-4 sm:px-8">
                <p className="mono mb-6 flex items-center gap-2 text-[11px] text-osso/50">
                    <Estrela className="text-acido" /> Fim do filme. Começo da história.
                </p>
                <p className="display poster-titulo text-[clamp(56px,10.5vw,190px)] leading-[0.95]">
                    Nós ainda não
                    <br />
<<<<<<< HEAD
                    <span className="text-acido">Tudo</span>
=======
                    Vivemos
                    <br />
                    <span className="texto-espectro">Tudo</span>
>>>>>>> d0f250706d1a6afce41c7c8899409d5c6f888247
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

            <div className="mono mt-12 flex flex-col gap-3 border-t border-osso/10 px-4 py-6 text-[10px] text-osso/45 sm:flex-row sm:items-center sm:justify-between sm:px-8">
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
