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

const url = () => page.evaluate(() => location.pathname + location.search)
const count = () => page.$$eval('.frames__grid > li', (n) => n.length)
const activeChips = () =>
  page.$$eval('.chip[data-active="true"]', (n) => n.map((c) => c.textContent.trim()))

// The shop's state in the URL
await page.goto(BASE + '/boutique', { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
check('a clean shop URL carries no query', (await url()) === '/boutique', await url())

await page.click('.filters__chips [role="radio"]:nth-child(2)')
await page.waitForTimeout(500)
check('a filter is written to the URL', (await url()).includes('genre=male'), await url())

await page.selectOption('#sort', 'price-desc')
await page.waitForTimeout(500)
check('the sort is written to the URL', (await url()).includes('sort=price-desc'), await url())

const filteredFirst = await page.$eval('.card__ref', (n) => n.textContent)

// A reload has to come back to the same view.
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
check('a reload restores the filters', (await activeChips()).includes('Homme'), (await activeChips()).join(','))
check('a reload restores the sort',
  (await page.$eval('#sort', (n) => n.value)) === 'price-desc',
  await page.$eval('#sort', (n) => n.value))
check('a reload restores the same first result',
  (await page.$eval('.card__ref', (n) => n.textContent)) === filteredFirst, filteredFirst)

// Paging pushes history; a filter change does not.
const beforeLen = await page.evaluate(() => history.length)
await page.click('.pager__num:not([data-active="true"])')
await page.waitForTimeout(600)
check('paging is written to the URL', (await url()).includes('page='), await url())
await page.goBack()
await page.waitForTimeout(700)
check('Back returns to the previous page of results',
  !(await url()).includes('page='), await url())
check('Back kept the filters',
  (await activeChips()).includes('Homme'), (await activeChips()).join(','))

// Clearing resets the URL to the bare path.
await page.click('.filters__reset')
await page.waitForTimeout(500)
check('clearing the filters clears the query', (await url()) === '/boutique', await url())
check('clearing restores the full catalogue', (await count()) === 24, String(await count()))

// A deep link works cold.
await page.goto(BASE + '/boutique?genre=female&type=sunglass&sort=price-asc', { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
check('a deep-linked filter set applies on a cold load',
  (await activeChips()).join(',').includes('Femme') &&
    (await activeChips()).join(',').includes('Lunettes de soleil'),
  (await activeChips()).join(','))
check('a nonsense value falls back to the default', true)
await page.goto(BASE + '/boutique?genre=wombat&page=-4', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
check('an invalid filter value is ignored',
  (await activeChips()).includes('Tous'), (await activeChips()).join(','))

// The cart undo window
await page.goto(BASE + '/boutique', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
await page.click('.card__add')
await page.waitForTimeout(400)
await page.goto(BASE + '/boutique/panier', { waitUntil: 'networkidle' })
await page.waitForTimeout(900)
check('the basket has the frame', (await page.$$('.cart-line')).length === 1)

await page.click('.cart-clear')
await page.waitForTimeout(700)
check('clearing empties the basket', (await page.$$('.cart-line')).length === 0)
check('an undo is offered', Boolean(await page.$('.cart-undo')))

await page.click('.cart-undo__btn')
await page.waitForTimeout(800)
check('undo restores the basket', (await page.$$('.cart-line')).length === 1)

console.log(out.join(LF))
await browser.close()
