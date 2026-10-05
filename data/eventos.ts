/**
 * Agenda do RL São Miguel.
 *
 * Para cadastrar um evento, copie um bloco e edite. Eventos que já passaram
 * somem sozinhos do site (comparação feita no navegador de quem visita).
 * O primeiro evento futuro vira o destaque "PRÓXIMO MOVIMENTO".
 *
 * ⚠ As datas abaixo são EXEMPLOS — troque pelas datas reais.
 */

export type TipoEvento = 'culto-rl' | 'united-day' | 'encontro' | 'conferencia' | 'batismo' | 'rede'

export const tiposEvento: Record<TipoEvento, string> = {
    'culto-rl': 'Culto RL',
    'united-day': 'United Day',
    encontro: 'Encontro com Deus',
    conferencia: 'Conferência',
    batismo: 'Batismo',
    rede: 'Rede',
}

export interface Evento {
    id: string
    nome: string
    tipo: TipoEvento
    /** AAAA-MM-DD */
    data: string
    /** para eventos de mais de um dia (AAAA-MM-DD) */
    dataFim?: string
    /** HH:MM */
    hora?: string
    local: string
    endereco?: string
    descricao?: string
    /** inscrição / mais informações. Sem link = abre o WhatsApp do RL. */
    link?: string
    imagem?: string
}

export const eventos: Evento[] = [
    {
        id: 'culto-rl-out-1',
        nome: 'Culto RL',
        tipo: 'culto-rl',
        data: '2026-10-10',
        hora: '19:30',
        local: 'Videira São Miguel',
        descricao: 'Louvor alto, Palavra direta e gente nova chegando. Traz alguém.',
        imagem: '/img/cenas/mov-culto.webp',
    },
    {
        id: 'united-day-2026',
        nome: 'United Day',
        tipo: 'united-day',
        data: '2026-10-03',
        hora: '15:00',
        local: 'Videira São Miguel',
        descricao: 'Um dia inteiro com a rede toda junta. Esporte, comida, adoração.',
        imagem: '/img/cenas/mov-united.webp',
    },
    {
        id: 'encontro-nov',
        nome: 'Encontro com Deus',
        tipo: 'encontro',
        data: '2026-11-13',
        dataFim: '2026-11-15',
        local: 'Local a confirmar',
        descricao: 'Três dias pra desligar de tudo e ligar no que importa.',
        imagem: '/img/cenas/mov-encontro.webp',
    },
    {
        id: 'batismo-nov',
        nome: 'Batismo',
        tipo: 'batismo',
        data: '2026-11-29',
        hora: '10:00',
        local: 'Videira São Miguel',
        descricao: 'Decidiu seguir Jesus? Esse é o próximo passo.',
        imagem: '/img/cenas/mov-batismo.webp',
    },
    {
        id: 'conferencia-dez',
        nome: 'Conferência da Rede',
        tipo: 'conferencia',
        data: '2026-12-03',
        hora: '18:00',
        local: 'Local a confirmar',
        descricao: 'A gente vai junto. Caravana saindo de São Miguel.',
        imagem: '/img/cenas/mov-eventos.webp',
    },
]

/* ---------------- helpers ---------------- */

/** data local (sem fuso: '2026-10-10' é dia 10 aqui, não dia 9) */
export function paraData(iso: string) {
    const [a, m, d] = iso.split('-').map(Number)
    return new Date(a, m - 1, d)
}

export function proximosEventos(lista: Evento[], hoje = new Date()) {
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
    return lista
        .filter((e) => paraData(e.dataFim ?? e.data) >= inicioHoje)
        .sort((a, b) => paraData(a.data).getTime() - paraData(b.data).getTime())
}

const SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

export function partesData(e: Evento) {
    const d = paraData(e.data)
    const f = e.dataFim ? paraData(e.dataFim) : null
    const dd = (x: Date) => String(x.getDate()).padStart(2, '0')
    const mm = (x: Date) => String(x.getMonth() + 1).padStart(2, '0')
    return {
        dia: dd(d),
        mes: mm(d),
        mesNome: MESES[d.getMonth()],
        semana: f ? `${SEMANA[d.getDay()]}–${SEMANA[f.getDay()]}` : SEMANA[d.getDay()],
        curta: f ? `${dd(d)}–${dd(f)}.${mm(f)}` : `${dd(d)}.${mm(d)}`,
        ano: d.getFullYear(),
    }
}

/** link "salvar na agenda" (Google Agenda) */
export function linkAgenda(e: Evento) {
    const limpa = (iso: string) => iso.replaceAll('-', '')
    let datas: string
    if (e.hora && !e.dataFim) {
        const [h, m] = e.hora.split(':').map(Number)
        const ini = `${limpa(e.data)}T${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}00`
        const fim = `${limpa(e.data)}T${String(Math.min(23, h + 3)).padStart(2, '0')}${String(m).padStart(2, '0')}00`
        datas = `${ini}/${fim}`
    } else {
        const fim = paraData(e.dataFim ?? e.data)
        fim.setDate(fim.getDate() + 1)
        const f = `${fim.getFullYear()}${String(fim.getMonth() + 1).padStart(2, '0')}${String(fim.getDate()).padStart(2, '0')}`
        datas = `${limpa(e.data)}/${f}`
    }
    const p = new URLSearchParams({
        action: 'TEMPLATE',
        text: `${e.nome} — RL São Miguel`,
        dates: datas,
        details: e.descricao ?? '',
        location: [e.local, e.endereco].filter(Boolean).join(' — '),
        ctz: 'America/Sao_Paulo',
    })
    return `https://calendar.google.com/calendar/render?${p.toString()}`
}
