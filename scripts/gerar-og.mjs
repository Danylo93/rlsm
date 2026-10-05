#!/usr/bin/env node
/**
 * Gera app/opengraph-image.jpg (1200×630) — a prévia do link no
 * WhatsApp/Instagram. JPEG leve (< 300 KB) para o WhatsApp mostrar sempre.
 *
 * Uso: npm run og   (refaça se trocar a foto da abertura)
 */

import sharp from 'sharp'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const fonte = join(raiz, 'assets', 'fonts', 'Anton-Regular.ttf')
const ACIDO = '#D7FF1F'

const texto = (markup, dpi) =>
    sharp({ text: { text: markup, font: 'Anton', fontfile: fonte, rgba: true, dpi, align: 'left', spacing: -40 } })
        .png()
        .toBuffer()

const fundo = await sharp(join(raiz, 'fotos-originais', 'hero.jpg'))
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .modulate({ brightness: 0.5, saturation: 0.85 })
    .toBuffer()

const titulo = await texto(`<span foreground="#F5F5F2">RADICAIS\nLIVRES</span>`, 800)
const sub = await texto(`<span foreground="${ACIDO}" letter_spacing="12000">SÃO MIGUEL</span>`, 190)
const lema = await texto(`<span foreground="#F5F5F2" letter_spacing="3000">UMA GERAÇÃO EM MOVIMENTO.</span>`, 96)

const mt = await sharp(titulo).metadata()
const ms = await sharp(sub).metadata()

// degradê para leitura à esquerda
const veu = Buffer.from(
    `<svg width="1200" height="630"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#080808" stop-opacity=".85"/><stop offset=".7" stop-color="#080808" stop-opacity=".1"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/><rect x="72" y="560" width="64" height="6" fill="${ACIDO}"/></svg>`
)

await sharp(fundo)
    .composite([
        { input: veu, top: 0, left: 0 },
        { input: titulo, top: 52, left: 64 },
        { input: sub, top: 52 + mt.height + 14, left: 72 },
        { input: lema, top: 52 + mt.height + 14 + ms.height + 22, left: 72 },
    ])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(raiz, 'app', 'opengraph-image.jpg'))

console.log('✓ app/opengraph-image.jpg')
