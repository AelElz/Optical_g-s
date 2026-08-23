import { useEffect, useRef } from 'react'

/*
 * Staggered enter for anything carrying .reveal or .wipe inside the ref.
 *
 * Deliberately NOT threshold-based: a chapter taller than the viewport never
 * reaches 50% visible, so a 0.5 threshold would simply never fire. This
 * triggers on any sliver crossing a band above the fold.
 */
export function useReveal(options = {}) {
  const { rootMargin = '0px 0px -10% 0px', once = true } = options
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const show = (el) => el.classList.add('is-in')
    const SELECTOR = '.reveal, .wipe'

    /* An element can be a target as well as a container. */
    const collect = (scope) =>
      scope.matches(SELECTOR)
        ? [scope, ...scope.querySelectorAll(SELECTOR)]
        : [...scope.querySelectorAll(SELECTOR)]

    if (!('IntersectionObserver' in window)) {
      collect(root).forEach(show)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show(entry.target)
            if (once) observer.unobserve(entry.target)
          } else if (!once) {
            entry.target.classList.remove('is-in')
          }
        })
      },
      { rootMargin, threshold: 0 },
    )

    /*
     * IntersectionObserver only delivers its first callback after a rendering
     * step, which never happens while the tab is in the background. Land on a
     * deep link, restore a scroll position, or open the site in a background
     * tab and the content would sit at opacity 0 for as long as the tab is
     * hidden. A synchronous rect check settles anything already on screen
     * without waiting for a frame.
     */
    const adopt = (targets) => {
      if (!targets.length) return
      const viewport = window.innerHeight
      targets.forEach((el) => {
        const rect = el.getBoundingClientRect()
        if (rect.top < viewport && rect.bottom > 0) show(el)
      })
      targets.forEach((el) => observer.observe(el))
    }

    adopt(collect(root))

    /*
     * Anything mounted after this point has to be picked up too.
     *
     * A snapshot taken once quietly assumes the subtree never changes. It
     * does: switching language replaces any list item whose React key is
     * derived from its own copy, and paging the shop grid replaces every
     * card. Replacements arriving unobserved sit at opacity 0 forever, which
     * renders as a correct DOM that is simply not painted.
     *
     * The keys here are stable and the grid keys on product id, so on a
     * language switch this observer sees nothing. It stays because the
     * failure it prevents is invisible, and childList mutations are rare
     * enough that the callback costs nothing until something remounts.
     */
    const structure = new MutationObserver((records) => {
      const fresh = []
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) fresh.push(...collect(node))
        }
      }
      adopt(fresh)
    })

    structure.observe(root, { childList: true, subtree: true })

    return () => {
      structure.disconnect()
      observer.disconnect()
    }
  }, [rootMargin, once])

  return ref
}
