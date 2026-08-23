/*
 * Prices.
 *
 * Moroccan dirham, grouped the French way. Intl supplies the narrow no-break
 * space between the thousands, which is the correct separator and, being
 * non-breaking, keeps "2 300" from wrapping across two lines.
 *
 * A few catalogue entries carry no price at all. Rendering those as "0 MAD"
 * would be a lie about a 5000 MAD frame, so they say so instead.
 */
/*
 * fr-FR, not fr-MA.
 *
 * fr-MA groups with a full stop, so a 2300 dirham frame priced through it
 * reads "2.300 MAD", which an English or Arabic speaker can reasonably take
 * for two dirhams and thirty centimes. The shop writes its own prices with a
 * space, so fr-FR is both the correct convention and the one already in use.
 */
const groupers = {
  fr: new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }),
  en: new Intl.NumberFormat('en-MA', { maximumFractionDigits: 0 }),
}

/*
 * Two non-breaking spaces, both deliberate.
 *
 * Intl groups French thousands with U+202F, a NARROW no-break space, and
 * Readex Pro has no glyph for it: the price rendered as "2?300". It is
 * swapped for the ordinary no-break space, which the face does carry.
 *
 * The space before MAD is non-breaking too, so a price never wraps with the
 * number on one line and its currency on the next.
 */
const NARROW_NBSP = '\u202F'
const NBSP = '\u00A0'

export function formatPrice(value, locale = 'fr') {
  const grouper = groupers[locale] ?? groupers.fr
  const grouped = grouper.format(Math.round(value || 0)).replaceAll(NARROW_NBSP, NBSP)
  return `${grouped}${NBSP}MAD`
}

export function priceLabel(value, locale, onRequest) {
  return value > 0 ? formatPrice(value, locale) : onRequest
}

/* Telephone links must carry the number unformatted; only the label is
   prettified. */
export const telHref = (number) => `tel:${String(number).replace(/[^\d+]/g, '')}`

export function formatPhone(number) {
  const digits = String(number).replace(/[^\d+]/g, '')
  const match = digits.match(/^(\+212)(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/)
  return match ? match.slice(1).join(' ') : digits
}
