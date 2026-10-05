#!/usr/bin/env node
/**
 * Pipeline de quadros do filme (vídeo controlado pela rolagem).
 *
 * Converte clipes de vídeo em sequências de quadros que o canvas reproduz
 * conforme a rolagem: rolar para baixo = vídeo para frente; para cima = para trás.
 *
 * Uso:
 *   1. Coloque os clipes em  filme/clipes/cena-01.mp4, cena-03.mp4 ...
 *      O número é o `numero` da cena em data/cenas.ts (1 = abertura,
 *      2 = quem somos, 3 = presença, 4 = células, 5 = discipulado,
 *      6 = movimento, 10 = manifesto, 11 = CTA). Aceita .mp4, .webm e .mov.
 *      Não precisa ter clipe para todas: cenas sem clipe usam as fotos.
 *   2. Rode:  npm run filme:quadros
 *   3. Saída: public/filme/cena-01/q-001.jpg ... + public/filme/manifest.json
 *      A página detecta o manifesto sozinha — nenhum código muda.
 *
 * ffmpeg: usa FFMPEG_PATH, o pacote ffmpeg-static (se instalado) ou o do sistema.
 *
 * Opções (variáveis de ambiente):
 *   FILME_FPS=12        quadros por segundo extraídos (padrão 12)
 *   FILME_LARGURA=1600  largura dos quadros desktop (padrão 1600)
 *   FILME_QUALIDADE=4   qualidade JPEG 2 (melhor) .. 7 (padrão 4)
 *   FILME_FORMATO=jpg   jpg | webp
 *   FILME_MOBILE=1      também gera quadros retrato (recorte central 2:3,
 *                       720px) em cena-XX/m/ para celulares em pé
 *
 * Dica de peso: 5 s de clipe a 12 fps = 60 quadros ≈ 4–6 MB em JPEG 1600px.
 * O site só baixa os quadros das cenas próximas da posição atual, e no
 * celular pula 1 a cada 2 quadros.
 */

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const dirClipes = join(raiz, 'filme', 'clipes')
const dirSaida = join(raiz, 'public', 'filme')

const FPS = Number(process.env.FILME_FPS || 12)
const LARGURA = Number(process.env.FILME_LARGURA || 1600)
const QUALIDADE = Number(process.env.FILME_QUALIDADE || 4)
const FORMATO = process.env.FILME_FORMATO === 'webp' ? 'webp' : 'jpg'
const MOBILE = process.env.FILME_MOBILE === '1'

function acharFfmpeg() {
    if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH
    try {
        const mod = require('ffmpeg-static')
        if (mod) return mod
    } catch {
        /* opcional */
    }
    return 'ffmpeg'
}

const ffmpeg = acharFfmpeg()
try {
    execFileSync(ffmpeg, ['-version'], { stdio: 'pipe' })
} catch {
    console.error(
        `✖ ffmpeg não encontrado ("${ffmpeg}").\n` +
            '  Instale (https://ffmpeg.org), rode `npm i -D ffmpeg-static` ou defina FFMPEG_PATH.'
    )
    process.exit(1)
}

if (!existsSync(dirClipes)) {
    mkdirSync(dirClipes, { recursive: true })
    console.log(`Pasta criada: ${dirClipes}\nColoque cena-01.mp4, cena-03.mp4... nela e rode de novo.`)
    process.exit(0)
}

const clipes = readdirSync(dirClipes)
    .filter((f) => /^cena-\d+\.(mp4|webm|mov)$/i.test(f))
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))

if (clipes.length === 0) {
    console.log(`Nenhum clipe em ${dirClipes} (esperado: cena-01.mp4, cena-02.mp4, ...).`)
    process.exit(0)
}

const qualidade = FORMATO === 'webp' ? ['-quality', String(90 - QUALIDADE * 6)] : ['-q:v', String(QUALIDADE)]

function extrair(origem, destino, filtro) {
    execFileSync(
        ffmpeg,
        ['-loglevel', 'error', '-i', origem, '-vf', filtro, ...qualidade, '-an', join(destino, `q-%03d.${FORMATO}`)],
        { stdio: 'pipe' }
    )
}

const manifesto = { fps: FPS, formato: FORMATO, cenas: [] }

for (const clipe of clipes) {
    const numero = Number(clipe.match(/\d+/)[0])
    const pasta = `cena-${String(numero).padStart(2, '0')}`
    const destino = join(dirSaida, pasta)
    rmSync(destino, { recursive: true, force: true })
    mkdirSync(destino, { recursive: true })

    console.log(`→ ${clipe}  (${FPS} fps, ${LARGURA}px, ${FORMATO})`)
    extrair(join(dirClipes, clipe), destino, `fps=${FPS},scale=${LARGURA}:-2:flags=lanczos`)

    if (MOBILE) {
        mkdirSync(join(destino, 'm'), { recursive: true })
        extrair(join(dirClipes, clipe), join(destino, 'm'), `fps=${FPS},crop='min(iw,ih*2/3)':ih,scale=720:-2:flags=lanczos`)
    }

    const quadros = readdirSync(destino).filter((f) => f.startsWith('q-')).length
    manifesto.cenas.push({ cena: numero, pasta: `/filme/${pasta}`, quadros, ...(MOBILE ? { mobile: true } : {}) })
    console.log(`  ✓ ${quadros} quadros em public/filme/${pasta}/${MOBILE ? ' (+ retrato em m/)' : ''}`)
}

writeFileSync(join(dirSaida, 'manifest.json'), JSON.stringify(manifesto, null, 2))
console.log('\n✓ public/filme/manifest.json — o site passa a usar os quadros automaticamente.')
