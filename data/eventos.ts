/**
 * Agenda oficial do RL São Miguel.
 * Eventos encerrados continuam visíveis, riscados. Cultos se repetem aos sábados.
 */

export type TipoEvento = 'culto-rl' | 'united-day' | 'encontro' | 'conferencia' | 'batismo' | 'rede' | 'amor-que-pensa'

export const tiposEvento: Record<TipoEvento, string> = {
    'culto-rl': 'Culto RL',
    'united-day': 'United Day',
    encontro: 'Encontro com Deus',
    conferencia: 'Conferência',
    batismo: 'Batismo',
    rede: 'Rede',
    'amor-que-pensa': 'Amor que pensa',
}

export interface Evento {
    id: string
    nome: string
    tipo: TipoEvento
    /** AAAA-MM-DD */
    data: string
    /** para eventos de mais de um dia (AAAA-MM-DD) */
    dataFim?: string
    recorrencia?: 'sabados'
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
        id: 'united-day-2026',
        nome: 'United Day',
        tipo: 'united-day',
        data: '2026-10-03',
        local: 'Videira São Miguel',
        imagem: '/img/cenas/mov-united.webp',
    },
    {
        id: 'encontro-out-2026',
        nome: 'Encontro com DEUS Videira São Miguel',
        tipo: 'encontro',
        data: '2026-10-09',
        dataFim: '2026-10-11',
        local: 'Videira São Miguel',
        imagem: '/img/cenas/mov-encontro.webp',
    },
    {
        id: 'culto-rl-sabados',
        nome: 'Culto dos RL São Miguel',
        tipo: 'culto-rl',
        data: '2026-10-10',
        recorrencia: 'sabados',
        local: 'Videira São Miguel',
        descricao: 'Todos os sábados.',
        imagem: '/img/cenas/mov-culto.webp',
    },
    {
        id: 'amor-que-pensa-2026',
        nome: 'Amor que pensa',
        tipo: 'amor-que-pensa',
        data: '2026-11-14',
        local: 'Local a confirmar',
        imagem: '/img/cenas/amor-que-pensa.webp',
    },
]

/* ---------------- helpers ---------------- */

/** data local (sem fuso: '2026-10-10' é dia 10 aqui, não dia 9) */
export function paraData(iso: string) {
    const [a, m, d] = iso.split('-').map(Number)
    return new Date(a, m - 1, d)
}

/** Dia oficial da agenda, independente do fuso de quem acessa. */
export function diaSaoPaulo(agora = new Date()) {
    const partes = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(agora)
    const parte = (tipo: string) => partes.find((p) => p.type === tipo)!.value
    return `${parte('year')}-${parte('month')}-${parte('day')}`
}

export function eventoEncerrado(e: Evento, hoje = diaSaoPaulo()) {
    return !e.recorrencia && (e.dataFim ?? e.data) < hoje
}

export function proximosEventos(lista: Evento[], agora = new Date()) {
    const hoje = diaSaoPaulo(agora)
    return lista
        .filter((e) => !eventoEncerrado(e, hoje))
        .map((e) => {
            if (!e.recorrencia) return e
            const proximo = paraData(hoje > e.data ? hoje : e.data)
            proximo.setDate(proximo.getDate() + (6 - proximo.getDay() + 7) % 7)
            const data = `${proximo.getFullYear()}-${String(proximo.getMonth() + 1).padStart(2, '0')}-${String(proximo.getDate()).padStart(2, '0')}`
            return { ...e, data }
        })
        .sort((a, b) => a.data.localeCompare(b.data))
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
        ...(e.recorrencia ? { recur: 'RRULE:FREQ=WEEKLY;BYDAY=SA' } : {}),
    })
    return `https://calendar.google.com/calendar/render?${p.toString()}`
}
