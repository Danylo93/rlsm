/**
 * Configurações gerais do site — edite aqui contatos e links.
 * Campos vazios ('') escondem o link correspondente.
 */

export const site = {
    nome: 'Radicais Livres São Miguel',
    curto: 'RL São Miguel',
    igreja: 'Videira São Miguel',
    lema: 'Uma geração que se levanta.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://rlsaomiguel.com.br',

    /** número com DDI+DDD, só dígitos. Ex.: '5511999999999'. Vazio = WhatsApp abre sem destinatário. */
    whatsapp: '',
    instagram: '', // ex.: 'https://www.instagram.com/seu-perfil'
    youtube: '',
    /** endereço exibido no rodapé e nos eventos (opcional) */
    endereco: '',
    mapa: '', // link do Google Maps (opcional)
}

/** link de WhatsApp com mensagem pronta */
export function linkWhatsApp(mensagem: string) {
    const texto = encodeURIComponent(mensagem)
    return site.whatsapp ? `https://wa.me/${site.whatsapp}?text=${texto}` : `https://wa.me/?text=${texto}`
}

export const ctas = {
    fazerParte: linkWhatsApp('Oi! Quero fazer parte do Radicais Livres São Miguel 🔥'),
    celula: linkWhatsApp('Oi! Quero encontrar uma célula perto de mim.'),
    falar: linkWhatsApp('Oi! Vim pelo site do RL São Miguel.'),
}

export const menu = [
    { rotulo: 'Início', href: '#inicio' },
    { rotulo: 'Sobre', href: '#sobre' },
    { rotulo: 'Células', href: '#celulas' },
    { rotulo: 'Eventos', href: '#eventos' },
    { rotulo: 'Galeria', href: '#galeria' },
    { rotulo: 'Fazer parte', href: '#fazer-parte' },
]
