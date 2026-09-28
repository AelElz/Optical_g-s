import fs from 'node:fs'
import { pathToFileURL } from 'node:url'
const { chromium } = await import(
  pathToFileURL(join(ROOT, 'node_modules/playwright-core/index.mjs')).href
)

const BASE = 'http://127.0.0.1:5219'
const OUT = process.env.OUT || '/private/tmp/claude-501/-Library-Developer-CommandLineTools/c90b5244-ff1e-443c-9f2f-e0c831dc02e3/scratchpad/sweep'
const W = Number(process.env.W || 1440)
const H = Number(process.env.H || 900)
fs.mkdirSync(OUT, { recursive: true })

const targets = JSON.parse(process.env.TARGETS)

const browser = await chromium.launch({ executablePath: BROWSER, headless: true })
const context = await browser.newContext({
  viewport: { width: W, height: H },
  locale: process.env.LOCALE || 'fr-FR',
})
// Seed the basket and skip the intro before any script on the page runs.
await context.addInitScript((cart) => {
  try {
    window.sessionStorage.setItem('opticalgs:seen-intro', '1')
    if (cart) window.localStorage.setItem('opticalgs:cart', cart)
  } catch {}
}, process.env.CART || '')

const page = await context.newPage()
const problems = []
page.on('console', (m) => { if (m.type() === 'error') problems.push('[console] ' + m.text()) })
page.on('pageerror', (e) => problems.push('[pageerror] ' + e.message))
page.on('response', (r) => { if (r.status() >= 400) problems.push('[' + r.status() + '] ' + r.url()) })

for (const { path: url, name, scroll = [0], click } of targets) {
  await page.goto(BASE + url, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(900)
  if (click) {
    await page.click(click).catch((e) => problems.push('[click] ' + click + ' ' + e.message))
    await page.waitForTimeout(900)
  }
  for (const y of scroll) {
    await page.evaluate((t) => {
      const l = window.__lenis
      if (l) { l.resize(); l.scrollTo(t, { immediate: true, force: true }) } else window.scrollTo(0, t)
    }, y)
    await page.waitForTimeout(1500)
    await page.screenshot({ path: `${OUT}/${name}-${y}.png` })
  }
}

console.log(problems.length ? [...new Set(problems)].slice(0, 30).join('\n') : 'clean')
await browser.close()
