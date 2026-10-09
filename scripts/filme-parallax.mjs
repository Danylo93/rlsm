#!/usr/bin/env node
/**
 * Filme 2.5D: transforma cada foto num clipe com câmera em profundidade.
 *
 * NÃO é vídeo de IA: nenhum pixel é inventado. Cada ponto da foto é só
 * deslocado conforme a distância dele (filme/profundidade/<nome>.png) — o que
 * está perto anda mais que o fundo, como numa câmera real. Uma pessoa tem
 * praticamente a mesma profundidade no corpo todo, então rosto e corpo se
 * movem inteiros, sem deformar.
 *
 * Cada plano tem um movimento escrito para a frase que aparece nele
 * (MOVIMENTOS, abaixo). `s` é o progresso do plano na rolagem (0..1),
 * contando a transição de entrada — o mesmo `u` com que o canvas escolhe o quadro.
 *
 * Uso:  npm run filme:profundidade   (uma vez, gera os mapas)
 *       npm run filme:parallax       (todos)   |   npm run filme:parallax hero cta
 * Saída: public/filme/<nome>/q-001.webp … (+ m/ retrato) e entradas no manifest.
 * Um clipe filmado de verdade em filme/clipes/<nome>.mp4 tem prioridade: esse
 * plano é pulado aqui e fica com o vídeo real (npm run filme:quadros).
 */

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const dirCenas = join(raiz, 'public', 'img', 'cenas')
const dirProf = join(raiz, 'filme', 'profundidade')
const dirClipes = join(raiz, 'filme', 'clipes')
const dirSaida = join(raiz, 'public', 'filme')

const LARGURA = 1600
const LARGURA_MOBILE = 720
const QUALIDADE = 74

/*
 * Parâmetros da câmera (cada um é um número ou uma lista de chaves [s, valor],
 * interpoladas com suavização):
 *   z    zoom geral (≥ 1.06 para nunca mostrar borda)
 *   m    dolly: avança (+) / recua (−) — o que está perto cresce mais
 *   v    vertigo: o fundo cresce e o primeiro plano fica parado
 *   tx   travelling lateral: + leva a câmera p/ a esquerda, − p/ a direita
 *   ty   grua: + câmera sobe, − desce
 *   px, py  pan geral (frações da largura)
 *   f    profundidade (0 fundo .. 1 perto) que fica parada no travelling/dolly
 *   foco, desfoque  profundidade nítida e quanto o resto desfoca (0..1)
 *   luz  realce das luzes fortes (palco, sol) 0..1
 */
const MOVIMENTOS = {
    // 01 ABERTURA — "Radicais Livres São Miguel / Nós ainda não vivemos tudo."
    // A câmera entra na multidão de mãos levantadas enquanto o título sai: ainda tem mais pela frente.
    hero: {
        quadros: 60,
        z: [[0, 1.08], [1, 1.13]],
        m: [[0, 0], [1, 0.06]],
        ty: [[0, -0.006], [1, 0.008]],
        f: 0.25,
        luz: [[0, 0.25], [0.45, 0.6], [1, 0.35]],
    },
    // 02 QUEM SOMOS — "Não é só um culto. É uma geração."
    // Começa fechado num canto e vai abrindo de lado até caber a geração inteira.
    geracao: {
        quadros: 60,
        z: [[0, 1.2], [0.75, 1.08], [1, 1.07]],
        tx: [[0, 0.019], [1, -0.014]],
        px: [[0, 0.035], [1, -0.01]],
        f: 0.35,
    },
    // 03 PRESENÇA — "Antes de qualquer movimento, existe um encontro."
    // Nada se mexe até a frase; aí o fundo (a luz) vem ao encontro da mão, que fica parada
    // (vertigo) — e a camada recortada continua alinhada para a palavra passar por trás.
    presenca: {
        quadros: 60,
        z: 1,
        v: [[0, 0], [0.45, 0.006], [1, 0.088]],
        foco: 1,
        desfoque: [[0, 0.45], [0.5, 0.45], [1, 0.1]],
        luz: [[0, 0.15], [0.5, 0.25], [1, 0.75]],
        rigido: 'presenca-frente',
    },
    // 04 CÉLULAS (fase A) — "A igreja não acontece só aqui."
    // Perto do grupo na igreja; quando "só aqui" é riscado, a câmera recua e sai do lugar.
    'celula-1': {
        quadros: 60,
        z: [[0, 1.1], [0.42, 1.13], [0.68, 1.04], [1, 1.04]],
        m: [[0, 0], [0.42, 0.012], [0.68, -0.042], [1, -0.048]],
        f: 0.4,
    },
    // 04 CÉLULAS (fase B) — "Ela acontece nas casas."
    // Aproximação lenta e quente: a câmera entra na sala como visita.
    'celula-2': {
        quadros: 60,
        mobile: false,
        z: [[0, 1.06], [1, 1.13]],
        m: [[0, 0], [1, 0.036]],
        f: 0.45,
        luz: 0.15,
    },
    // 05 DISCIPULADO — "Ninguém caminha sozinho."
    // Travelling lateral constante: a câmera caminha junto com o grupo, o mural fica para trás.
    discipulado: {
        quadros: 60,
        z: 1.11,
        tx: [[0, 0.018], [1, -0.018]],
        f: 0.45,
    },
    // 05 CUIDAR — "Ninguém fica pra trás. A gente se conhece pelo nome."
    // Chega perto dos três abraçados; o fundo desfoca e sobra só quem importa.
    cuidar: {
        quadros: 60,
        mobile: false,
        z: [[0, 1.04], [1, 1.11]],
        m: [[0, 0], [1, 0.048]],
        f: 0.55,
        foco: 0.6,
        desfoque: [[0, 0], [1, 0.55]],
    },
    // 05 TREINAR — "Crescer na Palavra, no caráter e no chamado."
    // A câmera sobe (grua) enquanto se aproxima: crescer.
    treinar: {
        quadros: 60,
        z: [[0, 1.08], [1, 1.13]],
        ty: [[0, -0.015], [1, 0.021]],
        f: 0.3,
        luz: 0.3,
    },
    // 05 ENVIAR — "Levar Jesus pra escola, pro trampo, pra rua, pra casa."
    // Recua e abre: o grupo vai para fora.
    enviar: {
        quadros: 60,
        z: [[0, 1.17], [1, 1.07]],
        m: [[0, 0.024], [1, -0.03]],
        px: [[0, -0.02], [1, 0.015]],
        f: 0.4,
    },

    // 06 LEGADO — montagem rápida, um movimento curto e enérgico por rótulo
    'mov-culto': { quadros: 30, z: [[0, 1.07], [1, 1.17]], m: [[0, 0], [1, 0.048]], f: 0.4 }, // Culto RL: avança
    'mov-united': { quadros: 30, z: 1.12, tx: [[0, 0.023], [1, -0.023]], f: 0.4 }, // United Day: lado a lado
    'mov-encontro': { quadros: 30, z: [[0, 1.1], [1, 1.14]], ty: [[0, -0.021], [1, 0.021]], f: 0.4 }, // Encontro com Deus: sobe
    'mov-celulas': { quadros: 30, z: [[0, 1.07], [1, 1.15]], m: [[0, 0], [1, 0.042]], f: 0.45 }, // Células: entra na roda
    'mov-batismo': { quadros: 30, z: 1.1, ty: [[0, 0.021], [1, -0.017]], v: [[0, 0], [1, 0.028]], f: 0.5 }, // Batismo: desce às águas
    'mov-evangelismo': { quadros: 30, z: 1.12, tx: [[0, -0.023], [1, 0.019]], f: 0.55, luz: 0.3 }, // Evangelismo: ao lado delas
    'mov-oracao': { quadros: 30, z: [[0, 1.06], [1, 1.1]], m: [[0, 0], [1, 0.018]], foco: 0.9, desfoque: [[0, 0.2], [1, 0.6]], luz: 0.35 }, // Oração: quase parado
    'mov-eventos': { quadros: 30, z: [[0, 1.17], [1, 1.07]], m: [[0, 0.018], [1, -0.024]], f: 0.35 }, // Eventos: abre

    // 11 FAZER PARTE — "Se existe algo a mais, nós queremos viver." + "Quero fazer parte"
    // Depois do preto, a câmera se junta ao grupo e para quando os botões aparecem.
    cta: {
        quadros: 60,
        z: [[0, 1.06], [0.25, 1.06], [0.55, 1.13], [1, 1.14]],
        m: [[0, 0], [0.25, 0], [0.55, 0.042], [1, 0.045]],
        f: 0.4,
        luz: 0.2,
    },
}

/* ---------------- interpolação ---------------- */

const suave = (t) => t * t * (3 - 2 * t)
function valor(chaves, s, padrao = 0) {
    if (chaves === undefined) return padrao
    if (typeof chaves === 'number') return chaves
    if (s <= chaves[0][0]) return chaves[0][1]
    for (let i = 1; i < chaves.length; i++) {
        const [s1, v1] = chaves[i]
        const [s0, v0] = chaves[i - 1]
        if (s <= s1) return v0 + (v1 - v0) * suave((s - s0) / (s1 - s0))
    }
    return chaves[chaves.length - 1][1]
}

/* ---------------- carregamento ---------------- */

async function rgb(arquivo, w, h) {
    return sharp(arquivo).resize(w, h, { fit: 'fill' }).removeAlpha().raw().toBuffer()
}

/** quantos degraus de profundidade (cada objeto anda com o degrau dele) */
const DEGRAUS = 24

/**
 * Separa a foto em objetos rígidos. As bordas são onde a profundidade salta
 * (silhuetas); cada região entre bordas — uma pessoa, um grupo colado, a
 * parede — vira um objeto que só é movido e escalado INTEIRO. Nada é esticado:
 * rosto e corpo nunca deformam.
 */
async function objetos(arquivo, w, h, rigido) {
    const buf = await sharp(arquivo).resize(w, h, { fit: 'fill' }).greyscale().blur(1).raw().toBuffer()
    const n = w * h
    const d = new Float32Array(n)
    for (let i = 0; i < n; i++) d[i] = buf[i] / 255

    // bordas: salto de profundidade
    const LIMIAR = 0.012
    const rotulo = new Int32Array(n).fill(-1)
    const borda = new Uint8Array(n)
    for (let y = 1; y < h - 1; y++)
        for (let x = 1; x < w - 1; x++) {
            const i = y * w + x
            const g = Math.max(Math.abs(d[i + 1] - d[i - 1]), Math.abs(d[i + w] - d[i - w])) / 2
            if (g > LIMIAR) borda[i] = 1
        }
    for (let x = 0; x < w; x++) borda[x] = borda[n - w + x] = 0

    // camada recortada da foto (pessoas da frente): um objeto só, perto de tudo
    let alfa = null
    if (rigido) {
        alfa = await sharp(rigido).resize(w, h, { fit: 'fill' }).ensureAlpha().extractChannel(3).raw().toBuffer()
        for (let i = 0; i < n; i++) if (alfa[i] > 127) borda[i] = 2
    }

    // regiões conectadas sem borda
    const pilha = new Int32Array(n)
    const soma = []
    const area = []
    let id = 0
    for (let s0 = 0; s0 < n; s0++) {
        if (borda[s0] || rotulo[s0] >= 0) continue
        let topo = 0
        pilha[topo++] = s0
        rotulo[s0] = id
        let sd = 0
        let a = 0
        while (topo) {
            const i = pilha[--topo]
            sd += d[i]
            a++
            const x = i % w
            for (const j of [i - w, i + w, x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1]) {
                if (j < 0 || j >= n || borda[j] || rotulo[j] >= 0) continue
                rotulo[j] = id
                pilha[topo++] = j
            }
        }
        soma.push(sd)
        area.push(a)
        id++
    }
    const media = soma.map((sd, k) => sd / area[k])

    // migalhas viram borda e são absorvidas pelos vizinhos
    const minimo = n * 0.0004
    for (let i = 0; i < n; i++) if (rotulo[i] >= 0 && area[rotulo[i]] < minimo) rotulo[i] = -1
    if (alfa) {
        media.push(1)
        for (let i = 0; i < n; i++) if (alfa[i] > 127) rotulo[i] = id
    }

    // bordas vão para o vizinho mais PERTO: a silhueta anda junto com a pessoa
    for (let falta = true, passada = 0; falta && passada < 200; passada++) {
        falta = false
        const novo = rotulo.slice()
        for (let i = 0; i < n; i++) {
            if (rotulo[i] >= 0) continue
            const x = i % w
            let melhor = -1
            for (const j of [i - w, i + w, x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1]) {
                if (j < 0 || j >= n || rotulo[j] < 0) continue
                if (melhor < 0 || media[rotulo[j]] > media[melhor]) melhor = rotulo[j]
            }
            if (melhor >= 0) novo[i] = melhor
            else falta = true
        }
        rotulo.set(novo)
    }

    const degrau = new Uint8Array(n)
    for (let i = 0; i < n; i++) degrau[i] = Math.round(media[Math.max(0, rotulo[i])] * (DEGRAUS - 1))
    return { d, degrau, objetos: media.length }
}

/* ---------------- renderização ---------------- */

function renderizar(fonte, borrada, cena, w, h, cfg, s) {
    const { d: prof, degrau } = cena
    const z = valor(cfg.z, s, 1.08)
    const m = valor(cfg.m, s)
    const v = valor(cfg.v, s)
    const tx = valor(cfg.tx, s) * w
    const ty = valor(cfg.ty, s) * w
    const px = valor(cfg.px, s) * w
    const py = valor(cfg.py, s) * w
    const f = valor(cfg.f, s, 0.4)
    const foco = valor(cfg.foco, s, 1)
    const desfoque = valor(cfg.desfoque, s)
    const luz = valor(cfg.luz, s)
    const cx = w / 2
    const cy = h / 2
    const saida = Buffer.allocUnsafe(w * h * 3)

    // um movimento rígido (escala + deslocamento) por degrau de profundidade
    const E = new Float64Array(DEGRAUS)
    const DX = new Float64Array(DEGRAUS)
    const DY = new Float64Array(DEGRAUS)
    for (let k = 0; k < DEGRAUS; k++) {
        const dk = k / (DEGRAUS - 1)
        E[k] = z * (1 + m * (dk - f) + v * (1 - dk))
        DX[k] = tx * (dk - f) + px
        DY[k] = ty * (dk - f) + py
    }
    const usados = [...new Set(degrau)].sort((a, b) => b - a) // perto → longe
    const longe = usados[usados.length - 1]

    const amostra = (img, qx, qy, o) => {
        const sx = qx < 0 ? 0 : qx > w - 1.001 ? w - 1.001 : qx
        const sy = qy < 0 ? 0 : qy > h - 1.001 ? h - 1.001 : qy
        const x0 = sx | 0
        const y0 = sy | 0
        const fx = sx - x0
        const fy = sy - y0
        const i00 = (y0 * w + x0) * 3
        const i01 = i00 + w * 3
        for (let c = 0; c < 3; c++)
            o[c] =
                (img[i00 + c] * (1 - fx) + img[i00 + 3 + c] * fx) * (1 - fy) +
                (img[i01 + c] * (1 - fx) + img[i01 + 3 + c] * fx) * fy
    }
    const cor = [0, 0, 0]
    const corB = [0, 0, 0]

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            // z-buffer: o objeto mais perto que cai neste pixel
            let qx = 0
            let qy = 0
            let acertou = false
            for (const k of usados) {
                qx = cx + (x - cx - DX[k]) / E[k]
                qy = cy + (y - cy - DY[k]) / E[k]
                const xi = Math.round(qx)
                const yi = Math.round(qy)
                if (xi < 0 || yi < 0 || xi >= w || yi >= h) continue
                if (degrau[yi * w + xi] === k) {
                    acertou = true
                    break
                }
            }
            const o = (y * w + x) * 3
            if (!acertou) {
                // fresta revelada atrás de alguém: preenche com o fundo desfocado
                qx = cx + (x - cx - DX[longe]) / E[longe]
                qy = cy + (y - cy - DY[longe]) / E[longe]
                amostra(borrada, qx, qy, cor)
            } else {
                amostra(fonte, qx, qy, cor)
                if (desfoque > 0) {
                    const di = prof[Math.min(h - 1, Math.max(0, Math.round(qy))) * w + Math.min(w - 1, Math.max(0, Math.round(qx)))]
                    const wb = Math.min(1, Math.abs(di - foco) * 2.5) * desfoque
                    if (wb > 0) {
                        amostra(borrada, qx, qy, corB)
                        for (let c = 0; c < 3; c++) cor[c] += (corB[c] - cor[c]) * wb
                    }
                }
            }
            let lum = Math.max(cor[0], cor[1], cor[2])
            // luzes fortes respiram (só brilho; não mexe em forma nem cor de pele)
            const ganho = luz > 0 && lum > 200 ? 1 + ((lum - 200) / 55) * luz * 0.35 : 1
            for (let c = 0; c < 3; c++) saida[o + c] = Math.min(255, cor[c] * ganho)
        }
    }
    return saida
}

async function gerar(nome, cfg, sufixo, larguraSaida, pasta) {
    const foto = join(dirCenas, `${nome}${sufixo}.webp`)
    const mapa = join(dirProf, `${nome}${sufixo}.png`)
    if (!existsSync(mapa)) throw new Error(`falta ${mapa} — rode npm run filme:profundidade ${nome}`)
    const meta = await sharp(foto).metadata()
    const w = larguraSaida
    const h = Math.round((w * meta.height) / meta.width / 2) * 2
    const fonte = await rgb(foto, w, h)
    const borrada = await sharp(fonte, { raw: { width: w, height: h, channels: 3 } }).blur(w / 180).raw().toBuffer()
    const rigido = cfg.rigido ? join(dirCenas, `${cfg.rigido}${sufixo}.webp`) : null
    const cena = await objetos(mapa, w, h, rigido)
    if (sufixo === '') console.log(`  ${nome}: ${cena.objetos} objetos rígidos`)

    rmSync(pasta, { recursive: true, force: true })
    mkdirSync(pasta, { recursive: true })
    for (let q = 0; q < cfg.quadros; q++) {
        const s = cfg.quadros === 1 ? 0 : q / (cfg.quadros - 1)
        const px = renderizar(fonte, borrada, cena, w, h, cfg, s)
        await sharp(px, { raw: { width: w, height: h, channels: 3 } })
            .webp({ quality: QUALIDADE })
            .toFile(join(pasta, `q-${String(q + 1).padStart(3, '0')}.webp`))
    }
}

/* ---------------- principal ---------------- */

const pedidos = process.argv.slice(2)
const reais = existsSync(dirClipes) ? readdirSync(dirClipes).map((f) => f.replace(/\.\w+$/, '')) : []
const arqManifesto = join(dirSaida, 'manifest.json')
const manifesto = existsSync(arqManifesto) ? JSON.parse(readFileSync(arqManifesto, 'utf8')) : { cenas: [], clipes: [] }
manifesto.clipes ??= []

for (const [nome, cfg] of Object.entries(MOVIMENTOS)) {
    if (pedidos.length && !pedidos.includes(nome)) continue
    if (reais.includes(nome)) {
        console.log(`· ${nome}: tem vídeo real em filme/clipes — pulado`)
        continue
    }
    const t0 = Date.now()
    const pasta = join(dirSaida, nome)
    await gerar(nome, cfg, '', LARGURA, pasta)
    const mobile = cfg.mobile !== false && existsSync(join(dirCenas, `${nome}-m.webp`))
    if (mobile) await gerar(nome, cfg, '-m', LARGURA_MOBILE, join(pasta, 'm'))

    manifesto.clipes = manifesto.clipes.filter((c) => c.clipe !== nome)
    manifesto.clipes.push({
        clipe: nome,
        pasta: `/filme/${nome}`,
        quadros: cfg.quadros,
        formato: 'webp',
        origem: 'parallax',
        ...(mobile ? { mobile: true } : {}),
        // a camada recortada da foto continua alinhada com estes quadros
        ...(cfg.rigido ? { frente: true } : {}),
    })
    console.log(`✓ ${nome}  ${cfg.quadros} quadros${mobile ? ' (+ retrato)' : ''}  ${((Date.now() - t0) / 1000).toFixed(1)}s`)
}

manifesto.clipes.sort((a, b) => a.clipe.localeCompare(b.clipe))
writeFileSync(arqManifesto, JSON.stringify(manifesto, null, 2))
console.log('\n✓ public/filme/manifest.json atualizado')
