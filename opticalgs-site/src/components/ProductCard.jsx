import { memo, useEffect, useRef, useState } from 'react'
import { useContent } from '../content'
import { useCart } from '../lib/cart-context'
import { priceLabel } from '../lib/format'
import { useLocale } from '../lib/locale-context'
import './ProductCard.css'

/*
 * One frame in the grid.
 *
 * The whole card is a button that opens the quick view, with the add control
 * as a separate button inside it. Two nested buttons would be invalid, so the
 * card is a <button> and the add control stops the event from reaching it.
 *
 * memo, because paging or changing a filter re-renders the grid and none of
 * these props change for a card that is staying put. With up to sixty cards
 * on screen that is the difference between a filter change being instant and
 * being a visible stall.
 */
function ProductCard({ product, index, onOpen }) {
  const t = useContent()
  const { locale } = useLocale()
  const { add } = useCart()
  const [added, setAdded] = useState(false)
  const timer = useRef(0)

  /* The confirmation resets itself, and the timer has to be cleared on
     unmount or React warns about a state update on a gone component every
     time someone changes a filter within two seconds of adding. */
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const soldOut = !product.stock
  const label = `${product.brand} ${product.ref}`

  const handleAdd = (event) => {
    event.stopPropagation()
    if (soldOut) return
    add(product.id, 1)
    setAdded(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAdded(false), 1600)
  }

  return (
    <article className="card reveal" style={{ '--i': index % 4 }}>
      <button
        type="button"
        className="card__surface"
        onClick={() => onOpen(product)}
        aria-label={`${t.boutique.card.view}, ${label}`}
      >
        <span className="card__media">
          <img
            className="card__image"
            src={product.image}
            alt={label}
            /*
             * The first row is what the visitor is waiting for; everything
             * below the fold is not. Explicit rather than lazy-everything,
             * because lazy-loading an image that is already in view costs a
             * round trip the eager path would have avoided.
             */
            loading={index < 4 ? 'eager' : 'lazy'}
            fetchPriority={index < 4 ? 'high' : 'auto'}
            decoding="async"
            width="700"
            height="467"
          />
          {soldOut && <span className="card__flag">{t.boutique.card.soldOut}</span>}
        </span>

        <span className="card__body">
          <span className="card__brand">{product.brand}</span>
          <span className="card__ref">{product.ref}</span>
          <span className="card__price">
            {priceLabel(product.price, locale, t.boutique.card.onRequest)}
          </span>
        </span>
      </button>

      <button
        type="button"
        className="card__add"
        onClick={handleAdd}
        disabled={soldOut}
        data-added={added}
        aria-label={`${t.boutique.card.add}, ${label}`}
      >
        <span>{added ? t.boutique.card.added : t.boutique.card.add}</span>
      </button>
    </article>
  )
}

export default memo(ProductCard)
