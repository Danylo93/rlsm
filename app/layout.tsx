import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import SmoothScroll from '@/components/cinematic/SmoothScroll'
import Grain from '@/components/cinematic/Grain'
import { BarraProgresso } from '@/components/cinematic/ScrollProgress'
import Cursor from '@/components/ui/Cursor'
import Revelador from '@/components/ui/Revelador'
import Header from '@/components/layout/Header'
import GracaFlutuante from '@/components/ui/GracaFlutuante'
import { site } from '@/data/site'

const anton = localFont({ src: '../assets/fonts/Anton-Regular.ttf', weight: '400', variable: '--font-anton', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

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
    themeColor: '#0b31ff',
    colorScheme: 'light dark',
    viewportFit: 'cover',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        // suppressHydrationWarning: o script abaixo adiciona a classe "js" ao <html>
        // antes do React hidratar — a diferença é intencional (vale só para este elemento)
        <html
            lang="pt-BR"
            className={`${anton.variable} ${inter.variable}`}
            suppressHydrationWarning
        >
            <head>
                {/* marca que há JS antes da primeira pintura: os estados "antes da animação"
                    só existem com JS, então sem JS tudo aparece normalmente */}
                <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
            </head>
            {/* suppressHydrationWarning: extensões do navegador injetam atributos no <body>
                (ex.: __processed_…__) antes do React hidratar — não é bug do site */}
            <body suppressHydrationWarning>
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
                <GracaFlutuante />
            </body>
        </html>
    )
}
