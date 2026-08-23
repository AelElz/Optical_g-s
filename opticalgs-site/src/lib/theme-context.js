import { createContext, useContext } from 'react'

/*
 * Kept apart from the provider for the same reason the router and locale
 * contexts are: Fast Refresh only tracks a module when everything it exports
 * is a component, so a hook living beside ThemeProvider would break hot
 * reload for every consumer.
 */

/*
 * Three states, not two.
 *
 * 'system' is the default and means "whatever the operating system is doing",
 * which is what someone who has never touched the control expects. It stays
 * that way until they choose, and only then is anything stored: a site that
 * pins itself to light the first time you visit has overridden a preference
 * you already expressed elsewhere.
 */
export const THEMES = ['system', 'light', 'dark']

export const ThemeContext = createContext({
  theme: 'system',
  resolved: 'light',
  setTheme: () => {},
  toggle: () => {},
})

export const useTheme = () => useContext(ThemeContext)
