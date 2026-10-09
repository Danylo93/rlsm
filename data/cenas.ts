/**
 * Roteiro do filme.
 *
 * Cada cena tem: comprimento (vh de rolagem), transição de entrada, planos
 * (fotos com câmera Ken Burns) e luz. Os textos de cada cena ficam nos
 * componentes de components/sections.
 *
 * Trocar fotos: substitua em fotos-originais/ e rode `npm run fotos`.
 * Vídeo de verdade: coloque clipes em filme/clipes/cena-01.mp4 (número = `numero`)
 * e rode `npm run filme:quadros` — a cena passa a tocar o vídeo pela rolagem.
 */

import type { CenaFilme } from '@/components/cinematic/motor'

const foto = (nome: string) => ({ src: `/img/cenas/${nome}.webp`, srcMobile: `/img/cenas/${nome}-m.webp` })

/* ---------------- Filme 1: abertura → movimento ---------------- */

export const filmeAbertura: CenaFilme[] = [
    {
        id: 'abertura',
        numero: 1,
        capitulo: 'Abertura',
        vh: 150,
        planos: [{ ...foto('hero'), alt: 'Jovens com as mãos levantadas em adoração' }],
        // a câmera avança para dentro da multidão
        camera: { z0: 1.06, z1: 1.08, py0: 0, py1: -0.35 },
        cameraMobile: { z0: 1.04, z1: 1.08, px0: 0, px1: 0.1 },
        luz: { feixe: { x: 0.64, angulo: -0.32, alfa: 0.12 }, quente: 0.35, vazamento: 0.22, exposicao: [0, -0.3] },
        escurecer: 0.25,
        ancora: 'inicio',
    },
    {
        id: 'geracao',
        numero: 2,
        capitulo: 'Quem somos',
        vh: 170,
        entrada: { tipo: 'dissolve', vh: 45 },
        planos: [{ ...foto('geracao'), alt: 'Família RL São Miguel reunida após o culto' }],
        // pan horizontal lento
        camera: { z0: 1.08, z1: 1.08, px0: -0.7, px1: 0.6 },
        cameraMobile: { z0: 1.06, z1: 1.04, px0: -0.6, px1: 0.6 },
        luz: { feixe: { x: 0.24, angulo: 0.28, alfa: 0.1 }, quente: 0.45, vazamento: 0.2 },
        escurecer: 0.35,
        ancora: 'sobre',
        ancoraEm: 0.3,
    },
    {
        id: 'presenca',
        numero: 3,
        capitulo: 'Presença',
        vh: 210,
        entrada: { tipo: 'blur', vh: 55 },
        planos: [
            {
                ...foto('presenca'),
                frente: { src: '/img/cenas/presenca-frente.webp', srcMobile: '/img/cenas/presenca-frente-m.webp' },
                alt: 'Mão levantada em adoração diante da luz do palco',
            },
        ],
        // zoom lento de câmera
        camera: { z0: 1.03, z1: 1.08, py0: 0.15, py1: -0.1 },
        cameraMobile: { z0: 1.02, z1: 1.08, py0: 0.1, py1: -0.05 },
        luz: { feixe: { x: 0.5, angulo: 0, alfa: 0.15, deriva: 0.02 }, quente: 0.5, vazamento: 0.45, exposicao: [-0.15, 0.12] },
        escurecer: 0.12,
        letterbox: 1,
    },
    {
        id: 'celulas',
        numero: 4,
        capitulo: 'Células',
        vh: 250,
        entrada: { tipo: 'corte', vh: 14 },
        corteInterno: 'corte',
        planos: [
            {
                ...foto('celula-1'),
                ate: 0.48,
                camera: { enquadramento: 'conter', z0: 1, z1: 1, px0: 0, px1: 0 },
                alt: 'Jovens e líderes juntos na igreja',
            },
            {
                ...foto('celula-2'),
                srcMobile: '/img/cenas/celula-2.webp',
                camera: { enquadramento: 'conter', z0: 1, z1: 1, px0: 0, px1: 0 },
                alt: 'Três amigos reunidos em uma casa',
            },
        ],
        luz: { quente: 0.45, vazamento: 0.15 },
        escurecer: 0.5,
        ancora: 'celulas',
        ancoraEm: 0.76,
    },
    {
        id: 'discipulado',
        numero: 5,
        capitulo: 'Discipulado',
        vh: 330,
        entrada: { tipo: 'dissolve', vh: 40 },
        corteInterno: 'dissolve',
        planos: [
            { ...foto('discipulado'), ate: 0.33, alt: 'Jovens e líderes reunidos em um encontro' },
            { ...foto('cuidar'), srcMobile: '/img/cenas/cuidar.webp', ate: 0.54, camera: { enquadramento: 'conter', z0: 1, z1: 1, py0: 0, py1: 0 }, alt: 'Três amigos juntos, com os braços nos ombros' },
            { ...foto('treinar'), ate: 0.74, camera: { enquadramento: 'conter', z0: 1, z1: 1, px0: 0, px1: 0 }, alt: 'Líder ensinando com o microfone' },
            { ...foto('enviar'), camera: { z0: 1.08, z1: 1.04, px0: -0.3, px1: 0.3 }, alt: 'Grupo do RL São Miguel reunido em um evento' },
        ],
        luz: { feixe: { x: 0.72, angulo: -0.22, alfa: 0.08 }, quente: 0.35, vazamento: 0.12 },
        escurecer: 0.45,
        letterbox: 0.6,
    },
    {
        id: 'movimento',
        numero: 6,
        capitulo: 'Legado',
        vh: 300,
        entrada: { tipo: 'flash', vh: 24 },
        corteInterno: 'corte',
        glitch: true,
        // montagem rápida: um plano por momento da vida do RL
        planos: [
            { ...foto('mov-culto'), rotulo: 'Culto RL', camera: { z0: 1.08, z1: 1.04, px0: -0.3, px1: 0.3 } },
            { ...foto('mov-united'), rotulo: 'United Day', camera: { z0: 1.04, z1: 1.08, px0: 0.3, px1: -0.2 } },
            { ...foto('mov-encontro'), rotulo: 'Encontro com Deus', camera: { z0: 1.08, z1: 1.06, py0: 0.3, py1: -0.2 } },
            { ...foto('mov-celulas'), rotulo: 'Células', camera: { z0: 1.05, z1: 1.08, px0: -0.4, px1: 0.2 } },
            { ...foto('mov-batismo'), rotulo: 'Batismo', camera: { z0: 1.08, z1: 1.05, px0: 0.2, px1: -0.2 } },
            { ...foto('mov-evangelismo'), rotulo: 'Evangelismo', camera: { z0: 1.05, z1: 1.08, px0: 0.4, px1: -0.1 } },
            { ...foto('mov-oracao'), rotulo: 'Oração', camera: { z0: 1.08, z1: 1.04 } },
            { ...foto('mov-eventos'), rotulo: 'Eventos', camera: { z0: 1.04, z1: 1.08, py0: -0.2, py1: 0.2 } },
        ],
        luz: { quente: 0.3, vazamento: 0.3 },
        escurecer: 0.32,
        saidaPreto: true,
    },
]

/* ---------------- Filme 2: manifesto → CTA ---------------- */

export const filmeFinal: CenaFilme[] = [
    {
        id: 'manifesto',
        numero: 10,
        capitulo: 'Manifesto',
        vh: 330,
        planos: [], // tela preta: só tipografia
        luz: { feixe: { x: 0.5, angulo: 0, alfa: 0.05, deriva: 0.3 } },
    },
    {
        id: 'cta',
        numero: 11,
        capitulo: 'Fazer parte',
        vh: 190,
        entrada: { tipo: 'preto', vh: 70 },
        planos: [{ ...foto('cta'), alt: 'Família Radicais Livres São Miguel reunida no Holy Fest' }],
        // Preenche o slide sem faixas laterais e sem zoom animado.
        camera: { enquadramento: 'cobrir', z0: 1, z1: 1, py0: 0, py1: 0 },
        cameraMobile: { enquadramento: 'cobrir', z0: 1, z1: 1 },
        luz: { feixe: { x: 0.45, angulo: 0.15, alfa: 0.12 }, quente: 0.55, vazamento: 0.35, exposicao: [-0.25, 0] },
        escurecer: 0.42,
        ancora: 'fazer-parte',
        ancoraEm: 0.55,
    },
]

/* ---------------- Cena 07: números ---------------- */

export interface Numero {
    /** número (anima contando) ou palavra (embaralha até assentar) */
    valor: number | string
    /** casas do número (01, 02...) */
    digitos?: number
    rotulo: string
    texto: string
    destaque?: boolean
}

/* Troque pelos números reais quando quiser (ex.: valor: 32, rotulo: 'CÉLULAS'). */
export const numeros: Numero[] = [
    { valor: 1, digitos: 2, rotulo: 'Geração', texto: 'Radicais Livres São Miguel vivendo o ano da  multiplicação.' },
    { valor: 'Várias', rotulo: 'Células', texto: 'Casas abertas pela cidade, toda semana. Sempre cabe mais um.' },
    { valor: 'Um', rotulo: 'Legado', texto: 'Viver Jesus de verdade e levar Jesus pra onde a gente for.' },
    { valor: 'Jesus.', rotulo: 'O centro de tudo', texto: 'Destinados a um avivamento', destaque: true },
]
