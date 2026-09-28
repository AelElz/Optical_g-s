import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './lib/cart.jsx'
import { LocaleProvider } from './lib/locale.jsx'
import { RouterProvider } from './lib/router.jsx'

/*
 * Locale and cart both sit ABOVE the router.
 *
 * Routes are the same in both languages, so switching language must not
 * remount the page you are on: it swaps the copy underneath you and leaves
 * the URL and the scroll position where they were.
 *
 * The cart is above it for a harder reason: a provider below the router
 * would be torn down and rebuilt on every navigation, so the basket would
 * empty itself on the way from the shop to the checkout.
 *
 * There is no theme provider. Each section owns its surface (ink, gold,
 * stone, white) through data-surface, as the Devorise stages do, so there is
 * no site-wide light or dark to switch.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LocaleProvider>
      <CartProvider>
        <RouterProvider>
          <App />
        </RouterProvider>
      </CartProvider>
    </LocaleProvider>
  </StrictMode>,
)
