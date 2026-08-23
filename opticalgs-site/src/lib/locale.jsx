import { useCallback, useEffect, useMemo, useState } from 'react'
import { dictionaries } from '../content'
import { DEFAULT_LOCALE, LOCALE_CODES, LocaleContext } from './locale-context'
import { readString, writeString } from './storage'

/*
 * Which language the whole site is in.
 *
 * Sits above the router in main.jsx, so switching language keeps you on the
 * page you were reading: the copy changes underneath you and the URL does not
 * move. Routes are deliberately locale-independent (/boutique is /boutique in
 * both), so there is nothing to redirect.
 */

const STORAGE_KEY = 'opticalgs:locale'

/*
 * A previous choice wins over everything. Failing that we read the browser's
 * own preference.
 *
 * `languages` is the ordered list the visitor actually configured; the
 * singular `language` is only the first of it, and Safari has shipped
 * versions where the two disagree.
 */
function detect() {
  const stored = readString(STORAGE_KEY, LOCALE_CODES)
  if (stored) return stored

  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const tag of preferred) {
    const code = String(tag || '')
      .toLowerCase()
      .split('-')[0]
    if (LOCALE_CODES.includes(code)) return code
  }
  return DEFAULT_LOCALE
}

export function LocaleProvider({ children }) {
  /* Lazy initialiser: detect() touches localStorage and navigator, neither of
     which should run on every render. */
  const [locale, setLocaleState] = useState(detect)

  const setLocale = useCallback((next) => {
    if (!LOCALE_CODES.includes(next)) return
    setLocaleState(next)
    writeString(STORAGE_KEY, next)
  }, [])

  /*
   * The document itself has to change language too, not just the copy.
   *
   * `lang` is what a screen reader takes its pronunciation rules from, what
   * the browser offers to translate from, and what hyphenation and quote
   * marks follow. A page of French text under lang="en" is read aloud in an
   * English accent.
   *
   * The title and description are the other half of the page nobody looks at
   * while developing: the tab, the search result and the link preview.
   */
  useEffect(() => {
    const { meta } = dictionaries[locale]

    document.documentElement.lang = locale
    document.title = meta.title

    const description = document.querySelector('meta[name="description"]')
    if (description) description.setAttribute('content', meta.description)
  }, [locale])

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
