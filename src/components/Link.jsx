import { useRouter } from '../lib/router-context'
import { resizeScroll, scrollTo, scrollToTop } from '../lib/motion'

/*
 * The only way to navigate. Never use a bare <a> for an internal path: it
 * reloads the document, which throws away the smooth scroll, the cart context
 * and the chosen language, and costs a full round trip to do it.
 *
 * External links open in a new tab and always carry rel="noopener
 * noreferrer". Without noopener the opened page gets a live window.opener
 * handle back into this one and can navigate it somewhere else.
 */
export default function Link({ to, children, onNavigate, ...rest }) {
  const { navigate } = useRouter()

  const external = /^(https?:|mailto:|tel:)/.test(to)

  if (external) {
    const isHttp = to.startsWith('http')
    return (
      <a
        href={to}
        {...(isHttp ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {children}
      </a>
    )
  }

  const handle = (event) => {
    // Let the browser handle anything the visitor asked to open elsewhere.
    if (event.defaultPrevented) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (event.button !== 0) return

    event.preventDefault()
    onNavigate?.()

    const [path, hash] = to.split('#')
    const samePage =
      (path || '/') === window.location.pathname + (path?.includes('?') ? window.location.search : '')

    if (hash && samePage) {
      scrollTo(`#${hash}`, { history: true })
      return
    }

    /*
     * Already here, and no hash asked for.
     *
     * The router treats this as a no-op because the path has not changed, so
     * clicking the logo or the current nav item from halfway down the page
     * did nothing at all: no navigation, no scroll, no feedback. Going back
     * to the top is what both of those controls are understood to mean.
     */
    if (samePage) {
      scrollToTop({ immediate: false })
      return
    }

    navigate(to)

    /*
     * A new page is a different height, and Lenis clamps every scroll to a
     * cached one. Re-measuring on the next frame, once the new tree has
     * painted, is the difference between the lower half of a tall page being
     * reachable and being silently unreachable.
     */
    if (hash) {
      requestAnimationFrame(() => scrollTo(`#${hash}`))
    } else {
      requestAnimationFrame(resizeScroll)
    }
  }

  return (
    <a href={to} onClick={handle} {...rest}>
      {children}
    </a>
  )
}
