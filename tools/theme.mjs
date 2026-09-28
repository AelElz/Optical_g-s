import fs from 'node:fs'
import { pathToFileURL } from 'node:url'
const { chromium } = await import(
  pathToFileURL(join(ROOT, 'node_modules/playwright-core/index.mjs')).href
)
const OUT = process.env.OUT
fs.mkdirSync(OUT, { recursive: true })
const scheme = process.env.SCHEME || 'dark'
const browser = await chromium.launch({ executablePath: BROWSER, headless: true })
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 }, locale: 'fr-FR', colorScheme: scheme,
})
await ctx.addInitScript((cart) => {
  try {
    sessionStorage.setItem('opticalgs:seen-intro', '1')
    if (cart) localStorage.setItem('opticalgs:cart', cart)
  } catch {}
}, process.env.CART || '')
const page = await ctx.newPage()
const problems = []
page.on('pageerror', (e) => problems.push('pageerror ' + e.message))
page.on('console', (m) => { if (m.type() === 'error') problems.push('console ' + m.text()) })
for (const { path, name, scroll } of JSON.parse(process.env.TARGETS)) {
  await page.goto('http://127.0.0.1:5219' + path, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(900)
  for (const y of scroll) {
    await page.evaluate((t) => {
      const l = window.__lenis
      if (l) { l.resize(); l.scrollTo(t, { immediate: true, force: true }) } else window.scrollTo(0, t)
    }, y)
    await page.waitForTimeout(1400)
    await page.screenshot({ path: `${OUT}/${name}-${y}.png` })
  }
}
console.log(problems.length ? [...new Set(problems)].join('\n') : 'clean')
await browser.close()
