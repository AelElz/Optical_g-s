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
import fs from 'node:fs'

const OUT = join(ROOT, 'tools/.shots')
fs.mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ executablePath: BROWSER, headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'fr-FR', reducedMotion: 'reduce' })
const page = await ctx.newPage()
const out = []
const check = (n, ok, d = '') => out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? '  -- ' + d : ''}`)

await page.goto('http://127.0.0.1:5219/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

check('the intro is skipped entirely', (await page.$('.preloader')) === null)
check('the page is not left covered',
  !(await page.evaluate(() => document.documentElement.classList.contains('is-loading'))))
check('Lenis is not started', await page.evaluate(() => !window.__lenis))

const revealed = await page.evaluate(() => {
  const all = [...document.querySelectorAll('.reveal, .wipe')]
  const hidden = all.filter((e) => {
    const cs = getComputedStyle(e)
    return cs.opacity === '0' || cs.transform !== 'none'
  })
  return { total: all.length, hidden: hidden.length }
})
check('nothing is left hidden by an animation that never runs',
  revealed.hidden === 0, JSON.stringify(revealed))

const progress = await page.evaluate(() => {
  const el = document.querySelector('.hero__grid')
  return { p: el.style.getPropertyValue('--p'), pd: el.style.getPropertyValue('--pd') }
})
check('scroll progress is pinned to its midpoint', progress.p === '0.5' && progress.pd === '0.5',
  JSON.stringify(progress))

const offsets = await page.evaluate(() =>
  [...document.querySelectorAll('.hero__copy, .hero__product, .craft__photo, .marquee__track')]
    .map((e) => getComputedStyle(e).translate))
check('no element is left displaced by a scroll-linked offset',
  offsets.every((t) => t === 'none'), offsets.join(' | '))

const anims = await page.evaluate(() =>
  [...document.querySelectorAll('.hero__frame, .hero__cue svg, .panel__grain')]
    .map((e) => getComputedStyle(e).animationName))
check('ambient animations are off', anims.every((a) => a === 'none'), anims.join(','))

await page.screenshot({ path: `${OUT}/home-top.png` })
await page.evaluate(() => window.scrollTo(0, 2900))
await page.waitForTimeout(800)
await page.screenshot({ path: `${OUT}/home-services.png` })

console.log(out.join(String.fromCharCode(10)))
await browser.close()
