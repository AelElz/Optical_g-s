import { useCallback, useEffect, useMemo, useState } from 'react'
import { THEMES, ThemeContext } from './theme-context'
import { readString, writeString } from './storage'

/*
 * Light, dark, or whatever the system is doing.
 *
 * The CSS carries all three cases (see the dark blocks in index.css); this
 * only decides which one is in force and writes `data-theme` on <html>. When
 * the choice is 'system' the attribute is REMOVED rather than set, so the
 * `prefers-color-scheme` media query is what applies. Setting
 * data-theme="light" and calling it system would pin the page against a
 * later change in the OS.
 */

const STORAGE_KEY = 'opticalgs:theme'
const QUERY = '(prefers-color-scheme: dark)'

/* Matches the inline script in index.html. If you change one, change both. */
function apply(theme) {
  const root = document.documentElement
  if (theme === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme)
}

export function ThemeProvider({ children }) {
  /* Lazy initialiser: storage is touched once, not on every render. The
     inline script has already applied this value before first paint. */
  const [theme, setThemeState] = useState(() => readString(STORAGE_KEY, THEMES) ?? 'system')
  const [systemDark, setSystemDark] = useState(() => window.matchMedia(QUERY).matches)

  /* Follow the OS while the choice is 'system'. Someone switching their Mac
     to dark at sunset should see this page follow, without a reload. */
  useEffect(() => {
    const list = window.matchMedia(QUERY)
    const onChange = (event) => setSystemDark(event.matches)
    setSystemDark(list.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [])

  const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  useEffect(() => {
    apply(theme)

    /*
     * The browser chrome has to match the page, or a dark page sits under a
     * white status bar on iOS and the seam is the first thing you see.
     * Read from the live computed style rather than a duplicated hex, so the
     * meta tag can never drift from the stylesheet.
     */
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      const surface = getComputedStyle(document.documentElement)
        .getPropertyValue('--surface')
        .trim()
      if (surface) meta.setAttribute('content', surface)
    }
  }, [theme, resolved])

  const setTheme = useCallback((next) => {
    if (!THEMES.includes(next)) return
    setThemeState(next)
    writeString(STORAGE_KEY, next)
  }, [])

  /*
   * The control is one button, so it flips to whichever theme is not
   * currently showing. Choosing explicitly is the point of pressing it, so
   * this never returns to 'system'; the stored value is cleared only by
   * clearing site data.
   */
  const toggle = useCallback(() => {
    setTheme(resolved === 'dark' ? 'light' : 'dark')
  }, [resolved, setTheme])

  const value = useMemo(
    () => ({ theme, resolved, setTheme, toggle }),
    [theme, resolved, setTheme, toggle],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
