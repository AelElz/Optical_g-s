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
const { clean, mailto, whatsapp, screen, LIMITS, isEmail, isPhone } = await import(
  pathToFileURL(join(ROOT, 'src/lib/forms.js')).href
)

const CR = String.fromCharCode(13)
const LF = String.fromCharCode(10)
const NUL = String.fromCharCode(0)
const HAS_CONTROL = new RegExp('[' + CR + LF + NUL + ']')

const out = []
const check = (n, ok, d = '') => out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? '  -- ' + d : ''}`)

/* ===================================================================
 * 1. The composer itself, against hostile input.
 * =================================================================== */

const attack =
  'Ayoub' + CR + LF + 'Bcc: attacker@evil.test' + CR + LF + 'Subject: pwned' + NUL + '&bcc=x@y.z'

const url = mailto('contact@opticalgs.com', attack, [
  ['Nom', clean(attack, LIMITS.name)],
  ['Message', clean(attack + 'A'.repeat(5000), LIMITS.message)],
  ['Script', clean('<script>alert(1)</script>', LIMITS.message)],
])

check('mailto is addressed to the shop', url.startsWith('mailto:contact@opticalgs.com?'))
const params = [...new URL(url.replace('mailto:', 'mailto://')).searchParams.keys()]
check('only subject and body are present', params.join(',') === 'subject,body', params.join(','))
check('no bcc parameter could be forged', !/[?&]bcc=/i.test(url))
check('no raw CR, LF or NUL survives into the URL', !HAS_CONTROL.test(url))

const decoded = decodeURIComponent(url.split('body=')[1])
/* The composer joins its own labelled lines with a newline, so the body is
   meant to contain exactly as many as it was given: three in, three out
   means the attack's CRLFs did not survive to forge extra headers. */
const bodyLines = decoded.split(LF)
check('no injected line survives into the body',
  bodyLines.length === 3 && !new RegExp('[' + CR + NUL + ']').test(decoded),
  bodyLines.length + ' lines: ' + JSON.stringify(bodyLines[0].slice(0, 56)))
check('a 5000 character flood is capped', decoded.length < LIMITS.message + 200, decoded.length + ' chars')
check('the script tag is inert text in a mail body, not markup',
  decoded.includes('<script>') && !url.includes('<script>'), 'encoded in the URL')

const wa = whatsapp('+212 750 914 702', [['Nom', clean(attack, LIMITS.name)]])
check('whatsapp link keeps only digits in the number',
  wa.startsWith('https://wa.me/212750914702?text='), wa.slice(0, 40))
check('whatsapp text carries no raw control characters', !HAS_CONTROL.test(wa))

/* ===================================================================
 * 2. The screen and the validators.
 * =================================================================== */

check('honeypot trips the screen', screen({ trap: 'ACME', startedAt: 0 }) === 'trap')
check('an instant submission trips the screen', screen({ trap: '', startedAt: Date.now() }) === 'fast')
check('a real submission passes the screen',
  screen({ trap: '', startedAt: Date.now() - 9000 }) === null)

check('email validator rejects nonsense',
  !isEmail('nope') && !isEmail('a@b') && !isEmail('a b@c.d') && isEmail('sara@opticalgs.com'))
check('phone validator accepts Moroccan formats',
  isPhone('+212666868630') && isPhone('06 66 86 86 30') && !isPhone('123'))

/* ===================================================================
 * 3. The forms in the browser: gating, and nothing persisted.
 * =================================================================== */

const browser = await chromium.launch({ executablePath: BROWSER, headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'fr-FR' })
await ctx.addInitScript(() => { try { sessionStorage.setItem('opticalgs:seen-intro', '1') } catch {} })
const page = await ctx.newPage()

// The success note only renders once every check has passed, so its presence
// or absence is a faithful readout of whether the form would have sent.
const sent = () => page.evaluate(() =>
  Boolean(document.querySelector('.form-status:not(.form-status--error)')))

await page.goto('http://127.0.0.1:5219/contact', { waitUntil: 'networkidle' })
await page.waitForTimeout(1400)
await page.click('button[type="submit"].btn--primary')
await page.waitForTimeout(700)
check('empty contact submit does not send', !(await sent()))
const errs = (await page.$$('.field__error')).length
check('empty contact submit shows errors as text', errs >= 2, errs + ' field errors')
check('focus moves to the first field that failed',
  (await page.evaluate(() => document.activeElement?.id)) === 'ct-name',
  await page.evaluate(() => document.activeElement?.id || ''))
check('errors are wired to their inputs for a screen reader',
  await page.evaluate(() =>
    [...document.querySelectorAll('.field__error')].every((e) => {
      const input = document.getElementById(e.id.replace('-error', ''))
      return input && input.getAttribute('aria-describedby') === e.id &&
        input.getAttribute('aria-invalid') === 'true'
    })))

// Honeypot filled: refused, and silently.
await page.fill('#ct-name', 'Bot')
await page.fill('#ct-email', 'bot@example.com')
await page.fill('#ct-message', 'hello there')
await page.evaluate(() => {
  const trap = document.querySelector('#ct-company')
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(trap, 'ACME')
  trap.dispatchEvent(new Event('input', { bubbles: true }))
})
await page.waitForTimeout(3300)
await page.click('button[type="submit"].btn--primary')
await page.waitForTimeout(700)
check('a honeypot submission does not send', !(await sent()))

// Sunday booking refused, Monday accepted.
await page.goto('http://127.0.0.1:5219/rendez-vous', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
const day = (target) => page.evaluate((d) => {
  const x = new Date()
  do { x.setDate(x.getDate() + 1) } while (x.getDay() !== d)
  return x.toISOString().slice(0, 10)
}, target)

await page.fill('#rv-name', 'Sara Test')
await page.fill('#rv-email', 'sara@example.com')
await page.fill('#rv-phone', '+212600000000')
await page.fill('#rv-date', await day(0))
await page.selectOption('#rv-time', '10:00')
await page.waitForTimeout(3300)
await page.click('button[type="submit"].btn--primary')
await page.waitForTimeout(400)
check('a Sunday booking is refused', !(await sent()),
  (await page.textContent('.field__error').catch(() => '')) || '')

await page.fill('#rv-date', await day(1))
await page.click('button[type="submit"].btn--primary')
await page.waitForTimeout(600)
check('a Monday booking is accepted', await sent())

const stored = await page.evaluate(() => ({
  local: Object.keys(localStorage),
  session: Object.keys(sessionStorage),
  cookies: document.cookie,
}))
check('storage holds only the locale, the cart and the intro flag',
  stored.local.every((k) => ['opticalgs:locale', 'opticalgs:cart'].includes(k)) &&
  stored.session.every((k) => k === 'opticalgs:seen-intro') && stored.cookies === '',
  JSON.stringify(stored))

console.log(out.join(LF))
await browser.close()
