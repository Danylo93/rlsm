#!/usr/bin/env node
/**
 * Mapas de profundidade das fotos das cenas (usados por filme-parallax.mjs).
 *
 * Roda o Depth Anything V2 (small) localmente via @huggingface/transformers.
 * O modelo NÃO gera nem altera imagem: só estima a distância de cada ponto
 * da foto (claro = perto, escuro = longe). Na primeira vez baixa ~100 MB.
 *
 * Uso:  npm run filme:profundidade            (todas as fotos)
 *       npm run filme:profundidade hero cta   (só essas)
 * Saída: filme/profundidade/<nome>.png e <nome>-m.png (retrato mobile)
 */

import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { pipeline, RawImage } from '@huggingface/transformers'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const dirCenas = join(raiz, 'public', 'img', 'cenas')
const dirSaida = join(raiz, 'filme', 'profundidade')
mkdirSync(dirSaida, { recursive: true })

const pedidos = process.argv.slice(2)
const fotos = readdirSync(dirCenas)
    .filter((f) => f.endsWith('.webp') && !f.includes('-frente'))
    .map((f) => f.replace(/\.webp$/, ''))
    .filter((n) => !pedidos.length || pedidos.includes(n.replace(/-m$/, '')))

console.log('Carregando Depth Anything V2…')
const estimar = await pipeline('depth-estimation', 'onnx-community/depth-anything-v2-small', { dtype: 'fp32' })

for (const nome of fotos) {
    const origem = join(dirCenas, `${nome}.webp`)
    const destino = join(dirSaida, `${nome}.png`)
    // 1280px basta: o mapa é suavizado depois
    const { data, info } = await sharp(origem).resize({ width: 1280, withoutEnlargement: true }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    const { depth } = await estimar(new RawImage(data, info.width, info.height, 3))
    await sharp(Buffer.from(depth.data), { raw: { width: depth.width, height: depth.height, channels: 1 } })
        .resize(info.width, info.height)
        .normalise()
        .png()
        .toFile(destino)
    console.log(`✓ ${nome}${existsSync(destino) ? '' : ' (falhou)'}`)
}
