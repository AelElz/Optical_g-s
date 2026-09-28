import { pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/* Resolved from this file, so the checks survive the repo being moved. */
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const BROWSER =
  process.env.BROWSER_PATH || '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
const { chromium } = await import(
  pathToFileURL(join(ROOT, 'node_modules/playwright-core/index.mjs')).href
)
const LF = String.fromCharCode(10)
const browser = await chromium.launch({ executablePath: BROWSER, headless: true })
const out = []

for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 2200 }, locale: 'fr-FR', colorScheme: scheme })
  await ctx.addInitScript(() => { try { sessionStorage.setItem('opticalgs:seen-intro', '1') } catch {} })
  const page = await ctx.newPage()

  for (const path of ['/', '/boutique', '/rendez-vous', '/a-propos', '/contact', '/boutique/panier']) {
    await page.goto('http://127.0.0.1:5219' + path, { waitUntil: 'networkidle' })
    await page.waitForTimeout(900)
    // Reveal everything so nothing is skipped for being at opacity 0.
    await page.evaluate(() => document.querySelectorAll('.reveal,.wipe,.rule').forEach((e) => e.classList.add('is-in')))
    await page.waitForTimeout(400)

    const bad = await page.evaluate(() => {
      const lum = (r, g, b) => {
        const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
      }
      const parse = (c) => (c.match(/[\d.]+/g) || []).map(Number)
      // Walk up for the first non-transparent background.
      const bgOf = (el) => {
        let n = el
        while (n && n !== document.documentElement) {
          const c = parse(getComputedStyle(n).backgroundColor)
          if (c.length >= 3 && (c[3] === undefined || c[3] > 0.85)) return c
          n = n.parentElement
        }
        return [255, 255, 255]
      }
      const blend = (fg, bg) => {
        const a = fg[3] === undefined ? 1 : fg[3]
        return [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a))
      }
      const ratio = (a, b) => {
        const l1 = lum(...a), l2 = lum(...b)
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
      }
      const found = []
      for (const el of document.querySelectorAll('p, span, a, li, h1, h2, h3, dt, dd, th, td, button, label, legend')) {
        const text = (el.textContent || '').trim()
        if (!text || el.children.length) continue
        const cs = getComputedStyle(el)
        if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) < 0.15) continue
        const r = el.getBoundingClientRect()
        if (r.width < 4 || r.height < 4) continue
        const fg = parse(cs.color)
        if (fg.length < 3) continue
        const bg = bgOf(el)
        const c = ratio(blend(fg, bg), bg)
        const size = parseFloat(cs.fontSize)
        const large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700)
        const need = large ? 3 : 4.5
        if (c < need) {
          found.push(`${(el.className || el.tagName).toString().slice(0, 34)} "${text.slice(0, 26)}" ${c.toFixed(2)}:1 (needs ${need})`)
        }
      }
      return found
    })
    if (bad.length) out.push(`${scheme} ${path}` + LF + bad.map((b) => '    ' + b).join(LF))
  }
  await ctx.close()
}

console.log(out.length ? out.join(LF) : 'every text node meets WCAG AA in both themes')
await browser.close()
