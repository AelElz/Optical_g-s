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
const BASE = 'http://127.0.0.1:5219'
const LF = String.fromCharCode(10)
const browser = await chromium.launch({ executablePath: BROWSER, headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'fr-FR' })
await ctx.addInitScript(() => { try { sessionStorage.setItem('opticalgs:seen-intro', '1') } catch {} })
const page = await ctx.newPage()
const out = []
const check = (n, ok, d = '') => out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? '  -- ' + d : ''}`)

// ---- Quick view: focus moves in, is trapped, and comes back ------------
await page.goto(BASE + '/boutique', { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
await page.evaluate(() => window.__lenis?.scrollTo(1500, { immediate: true, force: true }))
await page.waitForTimeout(800)
await page.click('.card__surface')
await page.waitForTimeout(700)

check('focus moves into the sheet',
  await page.evaluate(() => Boolean(document.activeElement?.closest('.quickview__sheet'))),
  await page.evaluate(() => document.activeElement?.className || ''))

const trapped = await page.evaluate(async () => {
  const inside = []
  for (let i = 0; i < 14; i += 1) {
    await new Promise((r) => setTimeout(r, 15))
    inside.push(Boolean(document.activeElement?.closest('.quickview__sheet')))
  }
  return inside
})
for (let i = 0; i < 14; i += 1) await page.keyboard.press('Tab')
check('tab never escapes the sheet',
  await page.evaluate(() => Boolean(document.activeElement?.closest('.quickview__sheet'))),
  await page.evaluate(() => (document.activeElement?.className || document.activeElement?.tagName || '') + ''))

await page.keyboard.press('Escape')
await page.waitForTimeout(600)
check('escape closes the sheet', (await page.$('.quickview__sheet')) === null)
check('focus returns to the card that opened it',
  await page.evaluate(() => Boolean(document.activeElement?.closest('.card'))),
  await page.evaluate(() => document.activeElement?.className || ''))

// ---- Document structure across every page ------------------------------
for (const path of ['/', '/boutique', '/rendez-vous', '/a-propos', '/contact', '/boutique/panier']) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  const audit = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')]
    const headings = [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => Number(h.tagName[1]))
    let jumps = 0
    for (let i = 1; i < headings.length; i += 1) if (headings[i] - headings[i - 1] > 1) jumps += 1
    const controls = [...document.querySelectorAll('button, a[href]')]
    const unnamed = controls.filter((c) => {
      const text = (c.textContent || '').trim()
      return !text && !c.getAttribute('aria-label') && !c.getAttribute('title')
    })
    const small = controls.filter((c) => {
      const r = c.getBoundingClientRect()
      return r.width > 0 && r.height > 0 && (r.height < 24 || r.width < 24)
    })
    return {
      h1: document.querySelectorAll('h1').length,
      noAlt: imgs.filter((i) => i.getAttribute('alt') === null).length,
      jumps,
      unnamed: unnamed.map((c) => (c.className || c.tagName).toString().slice(0, 30)),
      small: small.map((c) => (c.className || c.tagName).toString().slice(0, 30)),
      lang: document.documentElement.lang,
    }
  })
  check(`${path}: exactly one h1`, audit.h1 === 1, 'found ' + audit.h1)
  check(`${path}: every image declares alt`, audit.noAlt === 0, audit.noAlt + ' without')
  check(`${path}: no heading level is skipped`, audit.jumps === 0, audit.jumps + ' jumps')
  check(`${path}: every control has an accessible name`, audit.unnamed.length === 0, audit.unnamed.join(','))
  check(`${path}: no control smaller than 24px`, audit.small.length === 0, audit.small.join(','))
  check(`${path}: document language is set`, audit.lang === 'fr', audit.lang)
}

console.log(out.join(LF))
await browser.close()
