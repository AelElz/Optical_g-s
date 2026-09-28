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
const msgs = []
page.on('console', (m) => msgs.push(m.type() + ': ' + m.text()))
page.on('pageerror', (e) => msgs.push('pageerror: ' + e.message))
for (const p of ['/', '/boutique', '/rendez-vous', '/a-propos', '/contact', '/boutique/panier']) {
  await page.goto('http://127.0.0.1:5219' + p, { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
}
const noise = msgs.filter((m) => !m.startsWith('debug:') && !m.includes('React DevTools'))
console.log(noise.length ? noise.join('\n') : 'no warnings or errors on any page')
await browser.close()
