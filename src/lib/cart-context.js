import { createContext, useContext } from 'react'

export const CartContext = createContext({
  items: [],
  count: 0,
  subtotal: 0,
  add: () => {},
  setQuantity: () => {},
  remove: () => {},
  clear: () => {},
  restore: () => {},
  lines: [],
})

export const useCart = () => useContext(CartContext)
