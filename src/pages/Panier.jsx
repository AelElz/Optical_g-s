import { useCallback, useEffect, useRef, useState } from 'react'
import { useContent } from '../content'
import { useReveal } from '../hooks/useReveal'
import Field from '../components/Field'
import Footer from '../components/Footer'
import PageHead from '../components/PageHead'
import { ArrowRight, Minus, Plus } from '../components/Icons'
import Link from '../components/Link'
import { useCart } from '../lib/cart-context'
import { formatPrice, priceLabel } from '../lib/format'
import { useLocale } from '../lib/locale-context'
import { LIMITS, clean, isEmail, isPhone, mailto, screen, whatsapp } from '../lib/forms'
import './Forms.css'
import './Panier.css'

export default function Panier() {
  const t = useContent()
  const { locale } = useLocale()
  const revealRef = useReveal()
  const { items, subtotal, setQuantity, remove, clear, restore, lines: cartLines } = useCart()
  const copy = t.panier

  /*
   * The delivery city is held as an INDEX, not as its name.
   *
   * The <select> value would otherwise be the option's own text, so a
   * language switch leaves the box holding a string that is no longer in the
   * list: it goes blank and a required field silently becomes unsubmittable.
   * City names happen to be identical in both dictionaries, which makes this
   * the kind of bug that only appears when a third language is added.
   */
  const [city, setCity] = useState(-1)
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    postcode: '',
    notes: '',
    trap: '',
  })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const startedAt = useRef(Date.now()).current

  /*
   * Emptying the basket is destructive, instant, and there is no account to
   * recover it from, so it gets an undo window rather than a confirmation
   * dialog. A dialog interrupts the nine times out of ten the person meant
   * it; an undo bar costs nothing and covers the tenth.
   */
  const [undoable, setUndoable] = useState(null)
  const undoTimer = useRef(0)

  useEffect(() => () => window.clearTimeout(undoTimer.current), [])

  const clearWithUndo = useCallback(() => {
    const snapshot = cartLines
    clear()
    setUndoable(snapshot)
    window.clearTimeout(undoTimer.current)
    undoTimer.current = window.setTimeout(() => setUndoable(null), 8000)
  }, [clear, cartLines])

  const undo = useCallback(() => {
    window.clearTimeout(undoTimer.current)
    restore(undoable ?? [])
    setUndoable(null)
  }, [restore, undoable])

  const chosen = city >= 0 ? copy.cities[city] : null
  const shipping = chosen ? chosen.fee : 0
  const total = subtotal + shipping

  const set = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const lines = () => [
    [copy.fields.name, clean(values.name, LIMITS.name)],
    [copy.fields.email, clean(values.email, LIMITS.email)],
    [copy.fields.phone, clean(values.phone, LIMITS.phone)],
    [copy.fields.city, chosen?.name ?? ''],
    [copy.fields.address, clean(values.address, LIMITS.address)],
    [copy.fields.postcode, clean(values.postcode, LIMITS.postcode)],
    [copy.fields.notes, clean(values.notes, LIMITS.notes)],
    [copy.paymentTitle, copy.payment],
    [
      copy.summaryTitle,
      items.map((item) => `${item.brand} ${item.ref} x${item.quantity}`).join(', '),
    ],
    [copy.subtotal, formatPrice(subtotal, locale)],
    [copy.shipping, formatPrice(shipping, locale)],
    [copy.total, formatPrice(total, locale)],
  ]

  /*
   * Move focus to the first field that failed.
   *
   * Without it the error text renders somewhere above or below the fold and
   * the visitor is left at the submit button knowing only that something is
   * wrong. The order passed in is the visual order of the form, so focus
   * lands on the first problem going down the page.
   */
  const focusFirstError = (found, ids, order) => {
    const first = order.find((key) => found[key])
    if (first) document.getElementById(ids[first])?.focus()
  }

  const submit = (event, channel) => {
    event.preventDefault()
    if (screen({ trap: values.trap, startedAt })) return

    const found = {}
    if (clean(values.name, LIMITS.name).length < 2) found.name = copy.errors.name
    if (!isEmail(clean(values.email, LIMITS.email))) found.email = copy.errors.email
    if (!isPhone(clean(values.phone, LIMITS.phone))) found.phone = copy.errors.phone
    if (city < 0) found.city = copy.errors.city
    if (clean(values.address, LIMITS.address).length < 4) found.address = copy.errors.address

    setErrors(found)
    if (Object.keys(found).length) {
      focusFirstError(found, { name: 'pn-name', email: 'pn-email', phone: 'pn-phone', city: 'pn-city', address: 'pn-address' }, ['name', 'email', 'phone', 'city', 'address'])
      return
    }

    const subject = `${copy.checkoutTitle}, ${t.shop.name}`
    window.location.href =
      channel === 'whatsapp'
        ? whatsapp(t.shop.whatsapp, [[subject, ''], ...lines()])
        : mailto(t.shop.email, subject, lines())

    setSent(true)
  }

  /* Empty */

  if (!items.length) {
    return (
      <div ref={revealRef}>
        <main id="top" className="page" data-surface="stone">
          <PageHead kicker={copy.kicker} title={copy.title} />
          <section className="container cart-empty">
            <p className="cart-empty__lede reveal">{copy.empty}</p>
            <p className="lead reveal" style={{ '--i': 1 }}>
              {copy.emptyNote}
            </p>
            <p className="reveal" style={{ '--i': 2 }}>
              <Link to="/boutique" className="btn btn--primary">
                <span>{copy.emptyCta}</span>
                <ArrowRight className="btn__icon" />
              </Link>
            </p>

            {/* aria-live, so the offer is announced rather than only seen. */}
            <div aria-live="polite">
              {undoable?.length > 0 && (
                <p className="cart-undo">
                  <span>{copy.cleared}</span>
                  <button type="button" className="cart-undo__btn" onClick={undo}>
                    {copy.undo}
                  </button>
                </p>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    )
  }

  /* With items */

  return (
    <div ref={revealRef}>
      <main id="top" className="page" data-surface="stone">
        <PageHead kicker={copy.kicker} title={copy.title} />

        <section className="container page-layout cart-layout">
          <div className="cart-main">
            <ul className="cart-lines">
              {items.map((item, index) => (
                <li key={item.id} className="cart-line reveal" style={{ '--i': index % 3 }}>
                  <span className="cart-line__media">
                    <img src={item.image} alt="" width="900" height="675" loading="lazy" decoding="async" />
                  </span>

                  <span className="cart-line__info">
                    <span className="cart-line__brand">{item.brand}</span>
                    <span className="cart-line__ref">{item.ref}</span>
                    <span className="cart-line__unit">
                      {priceLabel(item.price, locale, t.boutique.card.onRequest)}
                    </span>
                  </span>

                  <span className="cart-line__controls">
                    <span className="stepper" role="group" aria-label={copy.lineQuantity}>
                      <button
                        type="button"
                        className="stepper__btn"
                        onClick={() => setQuantity(item.id, item.quantity - 1)}
                        aria-label={copy.decrease}
                      >
                        <Minus />
                      </button>
                      <span className="stepper__value">{item.quantity}</span>
                      <button
                        type="button"
                        className="stepper__btn"
                        onClick={() => setQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= Math.min(10, item.stock || 1)}
                        aria-label={copy.increase}
                      >
                        <Plus />
                      </button>
                    </span>

                    <button
                      type="button"
                      className="cart-line__remove"
                      onClick={() => remove(item.id)}
                      aria-label={copy.removed(`${item.brand} ${item.ref}`)}
                    >
                      {copy.remove}
                    </button>
                  </span>

                  <span className="cart-line__total">
                    {formatPrice(item.price * item.quantity, locale)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="cart-main__foot">
              <Link to="/boutique" className="link-arrow">
                <span>{copy.continue}</span>
                <ArrowRight size={13} />
              </Link>
              <button type="button" className="cart-clear" onClick={clearWithUndo}>
                {copy.clear}
              </button>
            </div>

            {/* Checkout */}
            <form
              className="form-card cart-checkout reveal"
              data-surface="white"
              onSubmit={(event) => submit(event, 'mail')}
              noValidate
            >
              <h2 className="form-card__title">{copy.checkoutTitle}</h2>

              <div className="field--trap" aria-hidden="true">
                <label htmlFor="pn-company">Company</label>
                <input
                  id="pn-company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={values.trap}
                  onChange={set('trap')}
                />
              </div>

              <h3 className="cart-checkout__legend">{copy.deliveryTitle}</h3>

              <div className="form-grid form-grid--two">
                <Field
                  id="pn-name"
                  label={copy.fields.name}
                  error={errors.name}
                  value={values.name}
                  onChange={set('name')}
                  autoComplete="name"
                  maxLength={LIMITS.name}
                  required
                />
                <Field
                  id="pn-email"
                  type="email"
                  label={copy.fields.email}
                  error={errors.email}
                  value={values.email}
                  onChange={set('email')}
                  autoComplete="email"
                  maxLength={LIMITS.email}
                  required
                />
                <Field
                  id="pn-phone"
                  type="tel"
                  label={copy.fields.phone}
                  error={errors.phone}
                  value={values.phone}
                  onChange={set('phone')}
                  autoComplete="tel"
                  maxLength={LIMITS.phone}
                  required
                />
                <Field
                  as="select"
                  id="pn-city"
                  label={copy.fields.city}
                  error={errors.city}
                  value={city}
                  onChange={(event) => {
                    setCity(Number(event.target.value))
                    setErrors((current) => {
                      const next = { ...current }
                      delete next.city
                      return next
                    })
                  }}
                  required
                >
                  <option value={-1}>{copy.cityPlaceholder}</option>
                  {copy.cities.map((option, index) => (
                    <option key={option.n} value={index}>
                      {copy.cityFee(option.name, option.fee)}
                    </option>
                  ))}
                </Field>
              </div>

              <div className="form-grid form-grid--two">
                <Field
                  id="pn-address"
                  label={copy.fields.address}
                  error={errors.address}
                  value={values.address}
                  onChange={set('address')}
                  autoComplete="street-address"
                  maxLength={LIMITS.address}
                  required
                />
                <Field
                  id="pn-postcode"
                  label={copy.fields.postcode}
                  value={values.postcode}
                  onChange={set('postcode')}
                  autoComplete="postal-code"
                  maxLength={LIMITS.postcode}
                  inputMode="numeric"
                />
              </div>

              <h3 className="cart-checkout__legend">{copy.paymentTitle}</h3>
              {/*
                One payment method, so it is stated rather than chosen. A
                radio group with a single option asks a question that has no
                second answer.
              */}
              <div className="cart-payment">
                <span className="cart-payment__name">{copy.payment}</span>
                <span className="cart-payment__note">{copy.paymentNote}</span>
              </div>

              <Field
                as="textarea"
                id="pn-notes"
                label={copy.fields.notes}
                value={values.notes}
                onChange={set('notes')}
                maxLength={LIMITS.notes}
              />

              <div aria-live="polite">
                {sent && <p className="form-status">{copy.success}</p>}
                {Object.keys(errors).length > 0 && (
                  <p className="form-status form-status--error">{copy.errors.generic}</p>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn--primary">
                  <span>{copy.submit}</span>
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={(event) => submit(event, 'whatsapp')}
                >
                  <span>{copy.whatsapp}</span>
                </button>
              </div>

              <p className="form-note">{copy.note}</p>
            </form>
          </div>

          {/* Summary */}
          <aside className="cart-summary page-aside reveal" data-surface="ink" style={{ '--i': 1 }}>
            <h2 className="cart-summary__title">{copy.summaryTitle}</h2>

            <ul className="cart-summary__lines">
              {items.map((item) => (
                <li key={item.id}>
                  <span>
                    {item.ref} <span aria-hidden="true">×</span> {item.quantity}
                  </span>
                  <span>{formatPrice(item.price * item.quantity, locale)}</span>
                </li>
              ))}
            </ul>

            <dl className="cart-summary__totals">
              <div>
                <dt>{copy.subtotal}</dt>
                <dd>{formatPrice(subtotal, locale)}</dd>
              </div>
              <div>
                <dt>{copy.shipping}</dt>
                {/*
                  A dash until a city is picked, not "0 MAD". Delivery is
                  never free, so a zero here reads as a promise the shop has
                  not made, and the total underneath would be wrong by
                  between 30 and 50 dirhams.
                */}
                <dd>{chosen ? formatPrice(shipping, locale) : copy.shippingPending}</dd>
              </div>
              <div className="cart-summary__total">
                <dt>{copy.total}</dt>
                <dd>{formatPrice(total, locale)}</dd>
              </div>
            </dl>
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  )
}
