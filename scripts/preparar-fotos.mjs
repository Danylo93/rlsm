#!/usr/bin/env node
/**
 * Prepara as fotos do site a partir de `fotos-originais/`.
 *
 *   fotos-originais/hero.jpg      →  public/img/cenas/hero.webp      (desktop, até 3840px)
 *                                     public/img/cenas/hero-m.webp    (mobile, retrato 2:3)
 *   fotos-originais/g-01.jpg      →  public/img/galeria/g-01.webp    (até 3840px)
 *
 * Uso:  npm run fotos
 *
 * Para trocar uma foto: substitua o arquivo em fotos-originais/ mantendo o nome
 * (ou ajuste data/cenas.ts) e rode o comando de novo. O recorte mobile usa o
 * ponto de foco abaixo; sem foco, o sharp escolhe a região de maior "atenção".
 *
 * `frente`: gera uma camada recortada (pessoas em primeiro plano) usada pela
 * cena PRESENÇA para o texto gigante passar POR TRÁS das pessoas. O recorte é
 * por luminância (silhuetas escuras contra luz) limitado às regiões indicadas.
 */

import sharp from 'sharp'
import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { join, dirname, parse } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const dirOrig = join(raiz, 'fotos-originais')
const dirCenas = join(raiz, 'public', 'img', 'cenas')
const dirGaleria = join(raiz, 'public', 'img', 'galeria')

/** foco horizontal (0..1) do recorte retrato mobile + camada de frente opcional */
const CONFIG = {
    hero: { foco: 0.5 },
    geracao: { foco: 0.42 },
    presenca: { foco: 0.5 },
    'celula-1': { foco: 0.55 },
    'celula-2': { foco: 0.5 },
    discipulado: { foco: 0.5 },
    cuidar: { foco: 0.5 },
    treinar: {},
    enviar: { foco: 0.68 },
    'mov-evangelismo': { foco: 0.4 },
    cta: { foco: 0.5 },
}

const LARGURA_DESKTOP = 3840
const MOBILE = { w: 2560, h: 3840 }
const LARGURA_GALERIA = 3840

for (const d of [dirCenas, dirGaleria]) mkdirSync(d, { recursive: true })

if (!existsSync(dirOrig)) {
    console.error(`Pasta ${dirOrig} não existe. Coloque as fotos originais nela.`)
    process.exit(1)
}

const arquivos = readdirSync(dirOrig).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))

/** recorte retrato centrado no foco, aplicado igual à foto e à camada de frente */
function recorteMobile(meta, foco) {
    const alvo = MOBILE.w / MOBILE.h
    let w = meta.width
    let h = meta.height
    if (w / h > alvo) w = Math.round(h * alvo)
    else h = Math.round(w / alvo)
    const left = Math.round(Math.min(meta.width - w, Math.max(0, foco * meta.width - w / 2)))
    const top = Math.round((meta.height - h) / 2)
    return { left, top, width: w, height: h }
}

async function camadaFrente(arquivo, cfg) {
    const { data, info } = await sharp(arquivo).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    const { width: W, height: H } = info
    const alfa = Buffer.alloc(W * H)
    const borda = cfg.borda ?? 0.03
    for (let y = 0; y < H; y++) {
        const ny = y / H
        for (let x = 0; x < W; x++) {
            const nx = x / W
            let peso = 0
            for (const r of cfg.regioes) {
                if (nx < r.x0 || nx > r.x1 || ny < r.y0 || ny > r.y1) continue
                // distância até a borda mais próxima; bordas na moldura da foto não suavizam
                const d = Math.min(
                    r.x0 <= 0 ? Infinity : nx - r.x0,
                    r.x1 >= 1 ? Infinity : r.x1 - nx,
                    r.y0 <= 0 ? Infinity : ny - r.y0,
                    r.y1 >= 1 ? Infinity : r.y1 - ny
                )
                peso = Math.max(peso, Math.min(1, d / borda))
            }
            if (peso === 0) continue
            const i = (y * W + x) * 3
            const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
            const t = Math.min(1, Math.max(0, (cfg.claro - lum) / (cfg.claro - cfg.escuro)))
            alfa[y * W + x] = Math.round(255 * t * peso)
        }
    }
    // blur devolve 3 canais (sRGB); extractChannel volta para 1 canal de máscara
    const mascara = await sharp(alfa, { raw: { width: W, height: H, channels: 1 } })
        .blur(2.2)
        .extractChannel(0)
        .raw()
        .toBuffer()
    return sharp(data, { raw: { width: W, height: H, channels: 3 } }).joinChannel(mascara, {
        raw: { width: W, height: H, channels: 1 },
    })
}

for (const f of arquivos) {
    const nome = parse(f).name
    const origem = join(dirOrig, f)

    if (nome.startsWith('g-')) {
        await sharp(origem)
            .rotate()
            .resize({ width: LARGURA_GALERIA, height: LARGURA_GALERIA, fit: 'inside' })
            .webp({ quality: 72 })
            .toFile(join(dirGaleria, `${nome}.webp`))
        console.log(`✓ galeria/${nome}.webp`)
        continue
    }

    const cfg = CONFIG[nome] ?? {}
    const orientada = await sharp(origem).rotate().toBuffer()
    const meta = await sharp(orientada).metadata()

    await sharp(origem)
        .rotate()
        .resize({ width: LARGURA_DESKTOP, height: LARGURA_DESKTOP, fit: 'inside' })
        .webp({ quality: 74 })
        .toFile(join(dirCenas, `${nome}.webp`))

    const mobile = sharp(orientada)
    if (cfg.foco !== undefined) mobile.extract(recorteMobile(meta, cfg.foco)).resize(MOBILE.w, MOBILE.h)
    else mobile.resize(MOBILE.w, MOBILE.h, { fit: 'cover', position: sharp.strategy.attention })
    await mobile.webp({ quality: 72 }).toFile(join(dirCenas, `${nome}-m.webp`))

    if (cfg.frente) {
        const frente = await camadaFrente(origem, cfg.frente)
        const buf = await frente.png().toBuffer()
        await sharp(buf)
            .resize({ width: LARGURA_DESKTOP, height: LARGURA_DESKTOP, fit: 'inside' })
            .webp({ quality: 80, alphaQuality: 90 })
            .toFile(join(dirCenas, `${nome}-frente.webp`))
        await sharp(buf)
            .extract(recorteMobile(meta, cfg.foco ?? 0.5))
            .resize(MOBILE.w, MOBILE.h)
            .webp({ quality: 78, alphaQuality: 90 })
            .toFile(join(dirCenas, `${nome}-frente-m.webp`))
        console.log(`✓ cenas/${nome}-frente(.webp|-m.webp)`)
    }

    console.log(`✓ cenas/${nome}.webp + ${nome}-m.webp`)
}
