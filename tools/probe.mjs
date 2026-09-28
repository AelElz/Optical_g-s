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
const browser = await chromium.launch({ executablePath: BROWSER, headless: true })
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'fr-FR' })).newPage()
await page.goto('http://127.0.0.1:5219' + (process.env.PATHNAME || '/'), { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
const info = await page.evaluate(() => {
  const panels = [...document.querySelectorAll('.panel')]
  let y = 0
  const main = document.querySelector('main')
  const rows = panels.map((p, i) => {
    const inner = p.querySelector('.panel__inner')
    const row = {
      i,
      tone: p.className.match(/panel--(\w+)/)?.[1],
      id: p.id,
      docTop: y,
      panelH: p.offsetHeight,
      innerH: inner ? inner.offsetHeight : null,
      stickyTop: getComputedStyle(p).top,
    }
    y += p.offsetHeight
    return row
  })
  return { viewport: innerHeight, docH: document.documentElement.scrollHeight, mainTop: main.offsetTop, rows }
})
console.log(JSON.stringify(info, null, 1))
await browser.close()
