import type { Metadata, Viewport } from 'next'
import { Anton, Archivo, JetBrains_Mono, Manrope } from 'next/font/google'
import './globals.css'
import SmoothScroll from '@/components/cinematic/SmoothScroll'
import Grain from '@/components/cinematic/Grain'
import { BarraProgresso } from '@/components/cinematic/ScrollProgress'
import Cursor from '@/components/ui/Cursor'
import Revelador from '@/components/ui/Revelador'
import Header from '@/components/layout/Header'
import { site } from '@/data/site'

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-anton', display: 'swap' })
const archivo = Archivo({ subsets: ['latin'], variable: '--font-archivo', axes: ['wdth'], display: 'swap' })
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' })

const titulo = 'Radicais Livres São Miguel | Uma geração que se levanta'
const descricao = 'Radicais Livres São Miguel. Destinados ao Avivamento'

export const metadata: Metadata = {
    metadataBase: new URL(site.url),
    title: titulo,
    description: descricao,
    applicationName: site.nome,
    keywords: ['Radicais Livres', 'RL São Miguel', 'Videira São Miguel', 'jovens', 'igreja', 'células'],
    alternates: { canonical: '/' },
    openGraph: {
        type: 'website',
        locale: 'pt_BR',
        url: '/',
        siteName: site.nome,
        title: titulo,
        description: descricao,
    },
    twitter: { card: 'summary_large_image', title: titulo, description: descricao },
}

export const viewport: Viewport = {
    themeColor: '#080808',
    colorScheme: 'dark',
    viewportFit: 'cover',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        // suppressHydrationWarning: o script abaixo adiciona a classe "js" ao <html>
        // antes do React hidratar — a diferença é intencional (vale só para este elemento)
        <html
            lang="pt-BR"
            className={`${anton.variable} ${archivo.variable} ${manrope.variable} ${mono.variable}`}
            suppressHydrationWarning
        >
            <head>
                {/* marca que há JS antes da primeira pintura: os estados "antes da animação"
                    só existem com JS, então sem JS tudo aparece normalmente */}
                <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
            </head>
            <body>
                <a
                    href="#numeros"
                    className="wide sr-only z-[90] bg-acido px-4 py-3 text-[12px] text-preto focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
                >
                    Pular a abertura
                </a>
                <SmoothScroll />
                <Revelador />
                <BarraProgresso />
                <Header />
                {children}
                <Grain />
                <Cursor />
            </body>
        </html>
    )
}
