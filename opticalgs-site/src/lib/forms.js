/*
 * Form handling for a site with no backend.
 *
 * Nothing is transmitted by these pages. Every form composes a message in the
 * visitor's own mail client or in WhatsApp, so no field value ever leaves the
 * device by way of this site.
 *
 * The protections below are still worth having, because the composed URL is
 * attacker-influenced input the moment a bot fills the form:
 *
 *   - a honeypot field, which a person never sees and a bot fills
 *   - a minimum fill time, because a bot submits instantly
 *   - a length cap per field
 *   - control characters stripped before the URL is composed
 *
 * encodeURIComponent already escapes CR, LF and &, so a value cannot forge an
 * "&bcc=" parameter on its own. The stripping is defence in depth, so safety
 * does not rest on one call staying where it is.
 */

export const MIN_FILL_MS = 3000

export const LIMITS = {
  name: 80,
  email: 120,
  phone: 32,
  subject: 120,
  city: 60,
  address: 160,
  postcode: 16,
  message: 2000,
  notes: 600,
}

/*
 * Strips C0 and C1 control characters, keeping ordinary whitespace.
 *
 * Written as escapes rather than literal characters on purpose: a literal
 * control character in a source file is invisible in every editor, survives
 * review, and is deleted by accident months later with nobody the wiser.
 */
const CONTROL = /[\u0000-\u001F\u007F-\u009F]/g

export function clean(value, limit = 200) {
  return String(value ?? '')
    .replace(CONTROL, '')
    .trim()
    .slice(0, limit)
}

/*
 * Deliberately permissive. A regex that tries to be RFC-correct rejects real
 * addresses, and there is no server here that a badly shaped one could
 * inject. At worst the visitor's own mail bounces back to their outbox.
 */
export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)

/* Moroccan mobile or landline, with or without the country code. */
export const isPhone = (value) => /^\+?[\d\s().-]{9,20}$/.test(value)

function compose(lines) {
  return lines
    .filter(Boolean)
    .map(([label, value]) => (value ? `${label}: ${value}` : ''))
    .filter(Boolean)
    .join('\n')
}

export function mailto(to, subject, lines) {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    compose(lines),
  )}`
}

export function whatsapp(number, lines) {
  return `https://wa.me/${String(number).replace(/\D/g, '')}?text=${encodeURIComponent(
    compose(lines),
  )}`
}

/*
 * Returns null when the submission looks human, or a reason code when it does
 * not. The caller shows the same generic message for every reason: telling a
 * bot which check it failed is telling it how to pass.
 */
export function screen({ trap, startedAt }) {
  if (trap) return 'trap'
  if (Date.now() - startedAt < MIN_FILL_MS) return 'fast'
  return null
}
