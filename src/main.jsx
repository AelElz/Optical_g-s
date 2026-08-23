import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './lib/cart.jsx'
import { LocaleProvider } from './lib/locale.jsx'
import { RouterProvider } from './lib/router.jsx'
import { ThemeProvider } from './lib/theme.jsx'

/*
 * Locale and cart both sit ABOVE the router.
 *
 * Routes are the same in both languages, so switching language must not
 * remount the page you are on: it swaps the copy underneath you and leaves
 * the URL, the scroll position and the sticky stack where they were.
 *
 * The cart is above it for a harder reason: a provider below the router
 * would be torn down and rebuilt on every navigation, so the basket would
 * empty itself on the way from the shop to the checkout.
 *
 * The theme is outermost because it writes an attribute on <html> and
 * nothing below it should be able to remount that work.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <LocaleProvider>
        <CartProvider>
          <RouterProvider>
            <App />
          </RouterProvider>
        </CartProvider>
      </LocaleProvider>
    </ThemeProvider>
  </StrictMode>,
)
