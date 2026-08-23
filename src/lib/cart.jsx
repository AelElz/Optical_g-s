import { useCallback, useEffect, useMemo, useState } from 'react'
import products from '../data/products.json'
import { CartContext } from './cart-context'
import { readJSON, writeJSON } from './storage'

/*
 * The basket.
 *
 * Only { id, quantity } is persisted, never a copy of the product. Prices and
 * stock live in one place, so a basket restored a week later reprices itself
 * against the current catalogue instead of quietly holding a stale figure,
 * and a product that has since been withdrawn simply drops out.
 */

const STORAGE_KEY = 'opticalgs:cart'
const MAX_QUANTITY = 10

const byId = new Map(products.map((product) => [product.id, product]))

/* Anything read back out of storage is untrusted: it may be an older shape,
   hand-edited, or from a different build entirely. */
function sanitise(raw) {
  if (!Array.isArray(raw)) return []
  const seen = new Set()
  const clean = []
  for (const entry of raw) {
    const id = Number(entry?.id)
    if (!byId.has(id) || seen.has(id)) continue
    const quantity = Math.min(MAX_QUANTITY, Math.max(1, Math.round(Number(entry?.quantity) || 1)))
    seen.add(id)
    clean.push({ id, quantity })
  }
  return clean
}

export function CartProvider({ children }) {
  const [lines, setLines] = useState(() => sanitise(readJSON(STORAGE_KEY, [])))

  useEffect(() => {
    writeJSON(STORAGE_KEY, lines)
  }, [lines])

  /*
   * A second tab is a real case for a shop: someone opens a few frames in
   * background tabs and adds from each. Without this, whichever tab writes
   * last wins and the others silently overwrite it.
   */
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY) return
      setLines(sanitise(readJSON(STORAGE_KEY, [])))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const add = useCallback((id, quantity = 1) => {
    const product = byId.get(id)
    if (!product) return
    setLines((current) => {
      const existing = current.find((line) => line.id === id)
      // Never offer more than the shop actually holds.
      const ceiling = Math.min(MAX_QUANTITY, Math.max(1, product.stock || 1))
      if (!existing) return [...current, { id, quantity: Math.min(quantity, ceiling) }]
      return current.map((line) =>
        line.id === id ? { ...line, quantity: Math.min(line.quantity + quantity, ceiling) } : line,
      )
    })
  }, [])

  const setQuantity = useCallback((id, quantity) => {
    const product = byId.get(id)
    if (!product) return
    const ceiling = Math.min(MAX_QUANTITY, Math.max(1, product.stock || 1))
    const next = Math.round(Number(quantity) || 0)
    setLines((current) =>
      next <= 0
        ? current.filter((line) => line.id !== id)
        : current.map((line) =>
            line.id === id ? { ...line, quantity: Math.min(next, ceiling) } : line,
          ),
    )
  }, [])

  const remove = useCallback((id) => {
    setLines((current) => current.filter((line) => line.id !== id))
  }, [])

  const clear = useCallback(() => setLines([]), [])

  /*
   * Restore a previous basket.
   *
   * Emptying a basket is destructive and instant, and there is no account to
   * recover it from. The cart page keeps the last state in a ref and offers
   * it back for a few seconds; this is what it calls.
   */
  const restore = useCallback((previous) => setLines(sanitise(previous)), [])

  const value = useMemo(() => {
    /* Joined to the catalogue on read, so the rest of the app never has to
       think about a line whose product no longer exists. */
    const items = lines
      .map((line) => {
        const product = byId.get(line.id)
        return product ? { ...product, quantity: line.quantity } : null
      })
      .filter(Boolean)

    return {
      items,
      count: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
      restore,
      lines,
    }
  }, [lines, add, setQuantity, remove, clear, restore])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
