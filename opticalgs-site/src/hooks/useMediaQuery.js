import { useEffect, useState } from 'react'

/*
 * A media query as state.
 *
 * Used where the DIFFERENCE between two layouts is structural rather than
 * cosmetic and CSS cannot express it: the opening hours are a seven-column
 * table on a wide screen and a seven-row one on a phone, and no amount of
 * CSS turns one into the other without either duplicating the table in the
 * DOM, which a screen reader then reads twice, or reordering it into seven
 * days followed by seven times, which loses the pairing entirely.
 *
 * The initial value is read synchronously in the lazy initialiser, so the
 * first paint is already correct and there is no flash of the wrong layout.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const list = window.matchMedia(query)
    const onChange = (event) => setMatches(event.matches)

    // Re-read on subscribe: the query can have changed between the first
    // render and this effect, on a resize or an orientation change.
    setMatches(list.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}
