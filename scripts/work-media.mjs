// Media pipeline for case studies and explorations.
// Usage: node scripts/work-media.mjs [slug ...]   (no slug = all)
// Reads scripts/work-media.config.mjs, writes public/work/<slug>/NN.webp
// and scripts/work-media.manifest.json.
//
// Files are numbered by position in the config (a failed source never shifts
// the others). A failed source makes the run exit 1 unless it has
// `optional: true` (then it is skipped with a warning and leaves a gap).
//
// Local sources need their dev servers running before the run:
//   beninbouge  -> http://localhost:5301  (O:/Projets/beninbouge: npx vite --port 5301)
//   najaexperts -> http://localhost:5302  (O:/Projets/najaynexperts/studio: npx next dev -p 5302)
//   procom      -> http://localhost:5303  (O:/Projets/procom: npx next dev -p 5303)
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { chromium } from '@playwright/test'
import { sources } from './work-media.config.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outRoot = join(root, 'public', 'work')
const manifestPath = join(root, 'scripts', 'work-media.manifest.json')
const only = process.argv.slice(2)
const MAX_WIDTH = 1600

const pad = (n) => String(n).padStart(2, '0')

async function capture(browser, src) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: src.height ?? 900 },
    deviceScaleFactor: 2,
    locale: src.locale ?? 'fr-FR',
    reducedMotion: 'reduce',
  })
  const page = await ctx.newPage()
  try {
    await page.goto(src.from.slice(4), { waitUntil: 'load', timeout: 45000 })
    try { await page.waitForLoadState('networkidle', { timeout: 10000 }) } catch {}
    await page.evaluate(() => document.fonts?.ready)
    await page.waitForTimeout(src.waitMs ?? 2500)
    // Hide framework dev indicators (Next.js, Vite) on local captures.
    await page.addStyleTag({ content: 'nextjs-portal, [data-nextjs-toast], vite-error-overlay { display: none !important }' })
    if (src.scrollY) {
      await page.evaluate((y) => window.scrollTo(0, y), src.scrollY)
      await page.waitForTimeout(1500)
    }
    if (src.prepare) await src.prepare(page)
    return await page.screenshot({ type: 'png' })
  } finally {
    await ctx.close()
  }
}

function load(src) {
  const f = src.from
  if (f.startsWith('git:')) {
    const [, ref, ...p] = f.split(':')
    return execFileSync('git', ['show', `${ref}:${p.join(':')}`], { cwd: root, maxBuffer: 64 * 1024 * 1024 })
  }
  if (f.startsWith('file:')) {
    const p = f.slice(5)
    return readFileSync(isAbsolute(p) ? p : join(root, p))
  }
  if (f.startsWith('gh:')) {
    const [, repo, ...p] = f.split(':')
    return execFileSync('gh', ['api', '-H', 'Accept: application/vnd.github.raw', `repos/${repo}/contents/${p.join(':')}`], { maxBuffer: 64 * 1024 * 1024 })
  }
  throw new Error(`unsupported source ${f}`)
}

const browser = only.length === 0 || Object.keys(sources).some((s) => (only.length === 0 || only.includes(s)) && sources[s].some((x) => x.from.startsWith('url:')))
  ? await chromium.launch()
  : null

// Keep manifest entries of slugs not rebuilt in this run.
let manifest = []
if (only.length && existsSync(manifestPath)) {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8')).filter((m) => !only.includes(m.slug))
}

let failed = false
for (const [slug, list] of Object.entries(sources)) {
  if (only.length && !only.includes(slug)) continue
  const dir = join(outRoot, slug)
  rmSync(dir, { recursive: true, force: true })
  if (list.length === 0) continue
  mkdirSync(dir, { recursive: true })
  let n = 0
  for (const src of list) {
    n += 1
    let buf
    try {
      buf = src.from.startsWith('url:') ? await capture(browser, src) : load(src)
    } catch (e) {
      const msg = `${slug} #${n} ${src.from}: ${e.message.split('\n')[0]}`
      if (src.optional) {
        console.warn(`SKIP (optional) ${msg}`)
        continue
      }
      console.error(`FAIL ${msg}`)
      failed = true
      continue
    }
    let img = sharp(buf)
    const meta = await img.metadata()
    const c = src.crop ?? {}
    const left = c.left ?? 0
    const top = c.top ?? 0
    const width = meta.width - left - (c.right ?? 0)
    const height = meta.height - top - (c.bottom ?? 0)
    if (src.crop) img = img.extract({ left, top, width, height })
    img = img.resize({ width: Math.min(width, MAX_WIDTH), withoutEnlargement: true })
    const file = `${pad(n)}.webp`
    const info = await img.webp({ quality: 80 }).toFile(join(dir, file))
    manifest.push({
      slug,
      file: `/work/${slug}/${file}`,
      width: info.width,
      height: info.height,
      kind: src.kind,
      source: src.from,
      alt: src.alt,
    })
    console.log(`${slug}/${file} ${info.width}x${info.height} (${Math.round(info.size / 1024)} KB)`)
  }
}

await browser?.close()
const order = Object.keys(sources)
manifest.sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug) || a.file.localeCompare(b.file))
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
console.log(`manifest: ${manifest.length} images`)
if (failed) {
  console.error('Some non-optional sources failed: see FAIL lines above.')
  process.exit(1)
}
