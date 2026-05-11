import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pubDir = resolve(__dirname, '../public')

// Master SVG — used to rasterize every PNG size below.
const masterSvg = readFileSync(resolve(pubDir, 'favicon.svg'))

// Sizes to generate. Naming follows the conventions modern browsers, iOS and
// PWA manifests look for, so we can wire them via <link>/manifest without fuss.
const sizes = [
  { file: 'favicon-16x16.png', size: 16 },
  { file: 'favicon-32x32.png', size: 32 },
  { file: 'favicon-48x48.png', size: 48 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
]

console.log('→ Rasterising favicon set from public/favicon.svg')

for (const { file, size } of sizes) {
  const out = resolve(pubDir, file)
  // density boost when up-rasterising small SVG → makes 16/32 sharper.
  const density = Math.max(72, size * 6)
  await sharp(masterSvg, { density })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(out)
  console.log(`  ✔ ${file} (${size}×${size})`)
}

// Maskable icon — same artwork with a transparent safe-zone padding so iOS / Android
// can clip it under their adaptive icon shape without cropping the mark.
const maskableSize = 512
const maskableInner = Math.round(maskableSize * 0.72)
const inner = await sharp(masterSvg, { density: maskableInner * 6 })
  .resize(maskableInner, maskableInner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer()

await sharp({
  create: {
    width: maskableSize,
    height: maskableSize,
    channels: 4,
    background: { r: 12, g: 10, b: 8, alpha: 1 }, // #0c0a08
  },
})
  .composite([{ input: inner, gravity: 'center' }])
  .png({ compressionLevel: 9 })
  .toFile(resolve(pubDir, 'icon-maskable-512.png'))
console.log(`  ✔ icon-maskable-512.png (${maskableSize}×${maskableSize})`)

// favicon.ico — a single 32×32 PNG renamed. Modern browsers don't need true ICO,
// and shipping an actual multi-image .ico would require a heavier dep.
// Fallback chain (favicon.svg → 32×32 PNG → renamed ICO) covers everything from
// Chrome to legacy IE.
const ico32 = await sharp(masterSvg, { density: 32 * 6 })
  .resize(32, 32)
  .png({ compressionLevel: 9 })
  .toBuffer()
writeFileSync(resolve(pubDir, 'favicon.ico'), ico32)
console.log(`  ✔ favicon.ico (PNG-based, 32×32)`)

console.log('Done.')
