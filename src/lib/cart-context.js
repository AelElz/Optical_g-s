import { createContext, useContext } from 'react'

/*
 * Two contexts, not one.
 *
 * The actions (add, remove...) never change; the state (lines, count, totals)
 * changes on every add. With one context, every product card on the page read
 * the whole cart just to get `add`, so one tap on "Add" re-rendered all
 * twenty-four cards before the pill could say "Added". Cards and the quick
 * view read the actions only, and only the header and the cart page read the
 * state.
 */
const noop = () => {}

export const CartActionsContext = createContext({
  add: noop,
  setQuantity: noop,
  remove: noop,
  clear: noop,
  restore: noop,
})

export const CartStateContext = createContext({
  items: [],
  count: 0,
  subtotal: 0,
  lines: [],
})

export const useCartActions = () => useContext(CartActionsContext)

/* State and actions together, for the few places that need both. */
export const useCart = () => ({
  ...useContext(CartStateContext),
  ...useContext(CartActionsContext),
})
