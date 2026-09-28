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
const browser = await chromium.launch({ executablePath: BROWSER, headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'fr-FR' })
await ctx.addInitScript(() => { try { sessionStorage.setItem('opticalgs:seen-intro', '1') } catch {} })
const page = await ctx.newPage()
const results = []
const check = (name, pass, detail = '') => results.push(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`)

await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)

// 1. No ancestor of the panel stack clips, or every sticky pin is ignored.
const clipping = await page.evaluate(() => {
  const bad = []
  let node = document.querySelector('.panel')?.parentElement
  while (node && node !== document.documentElement) {
    const o = getComputedStyle(node)
    if (['hidden', 'clip', 'auto', 'scroll'].includes(o.overflowY) ||
        ['hidden', 'clip', 'auto', 'scroll'].includes(o.overflowX)) {
      bad.push((node.tagName + '.' + node.className).slice(0, 40) + ' ' + o.overflow)
    }
    node = node.parentElement
  }
  for (const el of [document.documentElement, document.body]) {
    const o = getComputedStyle(el)
    if (o.overflow !== 'visible') bad.push(el.tagName + ' overflow:' + o.overflow)
  }
  return bad
})
check('no clipping ancestor above the sticky stack', clipping.length === 0, clipping.join(', '))

// 2. Every panel actually pins.
const sticky = await page.evaluate(() =>
  [...document.querySelectorAll('.panel')].map((p) => getComputedStyle(p).position))
check('all panels are sticky', sticky.every((p) => p === 'sticky'), sticky.join(','))

// 3. Walk the page: nothing but a panel or the footer under the fold line.
const gaps = await page.evaluate(async () => {
  const lenis = window.__lenis
  const found = []
  const H = innerHeight
  const docH = document.documentElement.scrollHeight
  for (let y = 0; y <= docH - H; y += 120) {
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y)
    document.body.getBoundingClientRect()
    for (const probe of [H - 30, Math.round(H / 2), 140]) {
      const el = document.elementFromPoint(innerWidth / 2, probe)
      if (!el?.closest('.panel, .footer, .navbar, .menu')) {
        found.push(`y=${y} probe=${probe} -> ${el ? el.tagName + '.' + el.className : 'null'}`)
      }
    }
  }
  return found
})
check('no uncovered band anywhere down the page', gaps.length === 0, gaps.slice(0, 3).join(' | '))

// 4. Every list row carries its hover fill element.
const fills = await page.evaluate(() => ({
  rows: document.querySelectorAll('.reveal-row').length,
  fills: document.querySelectorAll('.reveal-row .reveal-row__fill').length,
}))
check('every list row has its hover fill', fills.rows > 0 && fills.rows === fills.fills, JSON.stringify(fills))

// 5. Scroll progress publishes both values.
const prog = await page.evaluate(() => {
  const el = document.querySelector('.hero__grid')
  return { p: el.style.getPropertyValue('--p'), pd: el.style.getPropertyValue('--pd') }
})
check('scroll progress publishes --p and --pd', prog.p !== '' && prog.pd !== '', JSON.stringify(prog))

// 6. Nav target: clicking the logo must actually land at the top.
await page.evaluate(() => window.__lenis?.scrollTo(5000, { immediate: true, force: true }))
await page.waitForTimeout(600)
await page.click('.navbar__logo')
await page.waitForTimeout(900)
check('logo returns to the top', await page.evaluate(() => window.scrollY) < 40,
  'scrollY=' + (await page.evaluate(() => window.scrollY)))

// 7. The nav pill re-measures when the language changes.
const pill = async () => page.evaluate(() => {
  const p = document.querySelector('.navbar__indicator')
  return { left: p.style.left, width: p.style.width }
})
await page.click('.navbar__lang-btn[data-active="false"]')
await page.waitForTimeout(700)
const en = await pill()
const activeWidth = await page.evaluate(() =>
  Math.round(document.querySelector('.navbar__link[data-active="true"]').getBoundingClientRect().width))
check('nav pill matches the active link after a language switch',
  Math.abs(parseFloat(en.width) - activeWidth) < 2, `pill=${en.width} link=${activeWidth}px`)

// 8. The pill keeps its vertical centring (it must never animate transform).
const pillTransform = await page.evaluate(() => getComputedStyle(document.querySelector('.navbar__indicator')).transform)
check('nav pill keeps its translateY centring', pillTransform.includes('matrix'), pillTransform)

// 9. The basket survives navigation between pages.
await page.goto(BASE + '/boutique', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
await page.click('.card__add')
await page.waitForTimeout(500)
const before = await page.evaluate(() => document.querySelector('.navbar__badge')?.textContent)
await page.click('.navbar__link[href="/a-propos"]')
await page.waitForTimeout(900)
const after = await page.evaluate(() => document.querySelector('.navbar__badge')?.textContent)
check('cart survives client-side navigation', before === after && before === '1', `${before} -> ${after}`)

// 10. Deep link with a hash lands on the right chapter.
await page.goto(BASE + '/#services', { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)
const landed = await page.evaluate(() => {
  const el = document.querySelector('#services')
  const parent = el.parentElement
  let y = 0
  for (const sib of parent.children) { if (sib === el) break; y += sib.offsetHeight }
  return { scrollY: Math.round(window.scrollY), target: Math.round(y) }
})
check('deep link lands on its chapter', Math.abs(landed.scrollY - landed.target) < 30, JSON.stringify(landed))

console.log(results.join('\n'))
await browser.close()
