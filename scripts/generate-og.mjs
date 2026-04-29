import sharp from 'sharp'
import { writeFileSync } from 'node:fs'

const W = 1200
const H = 630

// Background gradient (deep blue-black) + cyan blueprint grid + content.
// Sharp can rasterize SVG strings directly, so we compose everything as SVG.

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a1525"/>
      <stop offset="100%" stop-color="#050a13"/>
    </linearGradient>
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#7ec8ff" stroke-width="0.6" opacity="0.15"/>
    </pattern>
    <radialGradient id="glow" cx="0.85" cy="0.2" r="0.6">
      <stop offset="0%" stop-color="#7ec8ff" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#7ec8ff" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- blueprint wireframe accent (top-right) -->
  <g stroke="#7ec8ff" stroke-width="1.5" fill="none" opacity="0.55">
    <polygon points="940,140 1090,140 1140,200 1010,260 870,200"/>
    <polygon points="940,140 1015,100 1090,140 1015,180"/>
    <polygon points="1090,140 1140,200 1100,210 1015,180"/>
    <line x1="940" y1="140" x2="1015" y2="180" stroke-dasharray="3,3"/>
    <circle cx="1015" cy="180" r="3" fill="#7ec8ff"/>
  </g>

  <!-- corner ticks -->
  <g stroke="#7ec8ff" stroke-width="1" opacity="0.4">
    <line x1="60" y1="60" x2="100" y2="60"/>
    <line x1="60" y1="60" x2="60" y2="100"/>
    <line x1="${W - 60}" y1="${H - 60}" x2="${W - 100}" y2="${H - 60}"/>
    <line x1="${W - 60}" y1="${H - 60}" x2="${W - 60}" y2="${H - 100}"/>
  </g>

  <!-- kicker -->
  <text x="80" y="200"
        font-family="ui-monospace, 'JetBrains Mono', monospace"
        font-size="18" letter-spacing="3"
        fill="#7ec8ff" opacity="0.85">/ LEAD ENGINEERING — COTONOU, BJ</text>

  <!-- title -->
  <text x="80" y="320"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="92" font-weight="400"
        fill="#faf8f4">Rostel Panoumassi</text>

  <!-- tagline line 1 -->
  <text x="80" y="400"
        font-family="-apple-system, 'Segoe UI', system-ui, sans-serif"
        font-size="28" font-weight="400"
        fill="#c8c5be">Je conçois et livre des produits logiciels fiables</text>

  <!-- tagline line 2 -->
  <text x="80" y="440"
        font-family="-apple-system, 'Segoe UI', system-ui, sans-serif"
        font-size="28" font-weight="400"
        fill="#c8c5be">pour des équipes qui n'ont pas le droit à l'erreur.</text>

  <!-- bottom-left signature -->
  <text x="80" y="${H - 60}"
        font-family="ui-monospace, 'JetBrains Mono', monospace"
        font-size="14" letter-spacing="2"
        fill="#8a8682">RMISSIMAWU@GMAIL.COM</text>

  <!-- bottom-right meta -->
  <text x="${W - 80}" y="${H - 60}" text-anchor="end"
        font-family="ui-monospace, 'JetBrains Mono', monospace"
        font-size="14" letter-spacing="2"
        fill="#8a8682">v3.0 · 2026</text>

  <!-- accent dot -->
  <circle cx="80" cy="155" r="4" fill="#7ec8ff"/>
</svg>
`

const buffer = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer()
writeFileSync(new URL('../public/og-default.png', import.meta.url), buffer)
console.log(`✔ wrote public/og-default.png — ${(buffer.byteLength / 1024).toFixed(1)} KB`)
