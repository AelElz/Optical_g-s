import { memo, useEffect, useRef, useState } from 'react'
import { useContent } from '../content'
import { useCartActions } from '../lib/cart-context'
import { priceLabel } from '../lib/format'
import { useLocale } from '../lib/locale-context'
import { Plus } from './Icons'
import Notation from './Notation'
import './ProductCard.css'

/*
 * One frame: the photograph on its white plate, then the house, the
 * reference, the optician's size notation and the price.
 *
 * The whole card is a button that opens the quick view, with the add control
 * as a separate button beside it (two nested buttons would be invalid).
 *
 * memo, because paging or changing a filter re-renders the grid and none of
 * these props change for a card that is staying put.
 */
function ProductCard({ product, index = 0, onOpen, eager = false }) {
  const t = useContent()
  const { locale } = useLocale()
  const { add } = useCartActions()
  const [added, setAdded] = useState(false)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const soldOut = !product.stock
  const label = `${product.brand} ${product.ref}`

  const handleAdd = () => {
    if (soldOut) return
    add(product.id, 1)
    setAdded(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAdded(false), 1600)
  }

  const first = eager || index < 4

  return (
    <article className="card">
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
            loading={first ? 'eager' : 'lazy'}
            fetchPriority={first ? 'high' : 'auto'}
            decoding="async"
            width="900"
            height="675"
          />
          {soldOut && <span className="card__flag">{t.boutique.card.soldOut}</span>}
        </span>

        <span className="card__body">
          <span className="card__brand">{product.brand}</span>
          <span className="card__ref">{product.ref}</span>
          <span className="card__meta">
            <Notation
              product={product}
              label={t.boutique.quickView.measurements}
              className="card__notation"
            />
            <span className="card__price tnum">
              {priceLabel(product.price, locale, t.boutique.card.onRequest)}
            </span>
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
        <Plus size={13} />
        <span>{added ? t.boutique.card.added : t.boutique.card.add}</span>
      </button>
    </article>
  )
}

export default memo(ProductCard)
