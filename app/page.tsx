import FilmeScroll from '@/components/cinematic/FilmeScroll'
import Hero from '@/components/sections/Hero'
import QuemSomos from '@/components/sections/QuemSomos'
import Presenca from '@/components/sections/Presenca'
import Celulas from '@/components/sections/Celulas'
import Discipulado from '@/components/sections/Discipulado'
import Movimento from '@/components/sections/Movimento'
import Numeros from '@/components/sections/Numeros'
import Eventos from '@/components/sections/Eventos'
import Galeria from '@/components/sections/Galeria'
import Manifesto from '@/components/sections/Manifesto'
import CTAFinal from '@/components/sections/CTAFinal'
import Footer from '@/components/layout/Footer'
import Marquee from '@/components/ui/Marquee'
import { filmeAbertura, filmeFinal } from '@/data/cenas'
import { site } from '@/data/site'

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.nome,
    alternateName: site.curto,
    url: site.url,
    description: 'Juventude da Videira São Miguel. Jovens vivendo Jesus, comunidade e propósito.',
    parentOrganization: { '@type': 'Church', name: site.igreja },
    sameAs: [site.instagram, site.youtube].filter(Boolean),
}

export default function Inicio() {
    return (
        <>
            <main>
                {/* FILME 1 — a rolagem conta a história */}
                <FilmeScroll
                    id="filme"
                    rotulo="Filme de abertura: Radicais Livres São Miguel"
                    cenas={filmeAbertura}
                    camadas={{
                        abertura: <Hero />,
                        geracao: <QuemSomos />,
                        presenca: <Presenca />,
                        celulas: <Celulas />,
                        discipulado: <Discipulado />,
                        movimento: <Movimento />,
                    }}
                />

                <Marquee
                    variante="acido"
                    inclinacao={-2}
                    itens={['Radicais Livres', 'São Miguel', 'Uma geração que se levanta', 'Jesus']}
                    className="-mb-4"
                />

                <Numeros />
                <Eventos />

                <Marquee
                    variante="contorno"
                    tamanho="xl"
                    reverso
                    velocidade={45}
                    itens={['Radical Livre', 'Ainda não Vivemos Tudo', 'Vida com propósito']}
                    className="border-y border-osso/10 bg-preto"
                />

                <Galeria />

                <Marquee
                    variante="escuro"
                    inclinacao={1.5}
                    itens={['Não somos o futuro', 'Somos agora', 'Onde existe um jovem, existe uma missão']}
                />

                {/* FILME 2 — manifesto e convite */}
                <FilmeScroll
                    id="final"
                    rotulo="Manifesto e convite"
                    cenas={filmeFinal}
                    capitulos={false}
                    camadas={{ manifesto: <Manifesto />, cta: <CTAFinal /> }}
                />
            </main>
            <Footer />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        </>
    )
}
