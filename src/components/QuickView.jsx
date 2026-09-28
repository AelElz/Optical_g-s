import { useEffect, useRef, useState } from 'react'
import { useContent } from '../content'
import { useCartActions } from '../lib/cart-context'
import { priceLabel } from '../lib/format'
import { useLocale } from '../lib/locale-context'
import { freezeBackground } from '../lib/motion'
import { whatsapp } from '../lib/forms'
import { Close, Minus, Plus } from './Icons'
import Link from './Link'
import Notation from './Notation'
import './QuickView.css'

/*
 * The frame detail sheet.
 *
 * A layer rather than a route, deliberately. Opening a frame from the grid
 * should not lose your filters, your sort order, your page or your scroll
 * position, and none of those live in the URL. Closing puts you back exactly
 * where you were with nothing to restore.
 */
export default function QuickView({ product, onClose }) {
  const t = useContent()
  const { locale } = useLocale()
  const { add } = useCartActions()
  const [quantity, setQuantity] = useState(1)
  const sheetRef = useRef(null)
  const closeRef = useRef(null)
  /* Where focus was before the sheet opened, so it can be given back. */
  const opener = useRef(null)

  const open = Boolean(product)
  const copy = t.boutique.quickView

  /* A new frame is a new sheet: the previous one's quantity must not carry
     over onto a different product. */
  useEffect(() => setQuantity(1), [product?.id])

  useEffect(() => {
    if (!open) return

    opener.current = document.activeElement
    freezeBackground(true)

    /*
     * Focus moves into the sheet, or a keyboard user is still standing in
     * the grid behind it, tabbing through cards they cannot see.
     */
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 60)

    const onKey = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      /*
       * The trap. Without it Tab walks straight out of the sheet and into
       * the page underneath, which is inert to the eye and not to the
       * keyboard.
       */
      const focusable = sheetRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)

    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKey)
      freezeBackground(false)
      /* Give focus back to the card that opened this, not to the top of the
         document: landing at the top of a 500-card grid is worse than not
         restoring focus at all. */
      opener.current?.focus?.({ preventScroll: true })
    }
  }, [open, onClose])

  if (!product) return null

  const label = `${product.brand} ${product.ref}`
  const soldOut = !product.stock
  const ceiling = Math.max(1, Math.min(10, product.stock || 1))

  const measurements = product.lens && product.bridge

  const facts = [
    product.material && [copy.material, product.material],
    product.color && [copy.colour, product.color],
    measurements && [
      copy.measurements,
      <Notation key="n" product={product} label={copy.measurements} />,
    ],
  ].filter(Boolean)

  const ask = whatsapp(t.shop.whatsapp, [
    [copy.ask, label],
    [copy.reference, product.ref],
  ])

  return (
    <div className="quickview" data-open={open}>
      {/*
        A plain div, not a button, and the sheet takes the accessible close.
        A full-screen button is announced as one enormous control and is the
        first thing a screen reader lands on.
      */}
      <div className="quickview__scrim" onClick={onClose} aria-hidden="true" />

      <div
        className="quickview__sheet"
        data-surface="white"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        ref={sheetRef}
      >
        <button type="button" className="quickview__close" onClick={onClose} ref={closeRef}>
          <Close size={17} />
          <span className="visually-hidden">{copy.close}</span>
        </button>

        <div className="quickview__media">
          <img src={product.image} alt={label} width="900" height="675" decoding="async" />
        </div>

        <div className="quickview__body">
          <p className="quickview__brand">{product.brand}</p>
          <h2 className="quickview__title">{product.ref}</h2>
          <p className="quickview__price tnum">
            {priceLabel(product.price, locale, t.boutique.card.onRequest)}
          </p>

          {facts.length > 0 && (
            <dl className="quickview__facts">
              {facts.map(([term, value]) => (
                <div className="quickview__fact" key={term}>
                  <dt>{term}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {measurements && <p className="quickview__note">{copy.measurementsNote}</p>}

          <div className="quickview__actions">
            <div className="stepper" role="group" aria-label={t.panier.lineQuantity}>
              <button
                type="button"
                className="stepper__btn"
                onClick={() => setQuantity((n) => Math.max(1, n - 1))}
                disabled={quantity <= 1}
                aria-label={t.panier.decrease}
              >
                <Minus />
              </button>
              <span className="stepper__value" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                className="stepper__btn"
                onClick={() => setQuantity((n) => Math.min(ceiling, n + 1))}
                disabled={quantity >= ceiling}
                aria-label={t.panier.increase}
              >
                <Plus />
              </button>
            </div>

            <button
              type="button"
              className="btn btn--primary quickview__add"
              disabled={soldOut}
              onClick={() => {
                add(product.id, quantity)
                onClose()
              }}
            >
              <span>{soldOut ? t.boutique.card.soldOut : copy.add}</span>
            </button>
          </div>

          <div className="quickview__links">
            <Link to="/boutique/panier" className="link-arrow" onNavigate={onClose}>
              <span>{copy.cart}</span>
            </Link>
            <Link to={ask} className="link-arrow">
              <span>{copy.ask}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
