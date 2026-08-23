import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useContent } from '../content'
import { useCart } from '../lib/cart-context'
import { LOCALES, useLocale } from '../lib/locale-context'
import { freezeBackground, onFrame, write } from '../lib/motion'
import { useRouter } from '../lib/router-context'
import { useTheme } from '../lib/theme-context'
import { Bag, Close, Moon, Sun } from './Icons'
import Link from './Link'
import Logo from './Logo'
import './Navbar.css'

/* Past this the announcement strip folds away and the bar tightens. */
const CONDENSE_AT = 40

export default function Navbar() {
  const t = useContent()
  const { path } = useRouter()
  const { count } = useCart()
  const { locale, setLocale } = useLocale()
  const { resolved, toggle } = useTheme()

  const [open, setOpen] = useState(false)
  const barRef = useRef(null)
  const listRef = useRef(null)
  const pillRef = useRef(null)

  const { links } = t.nav

  /*
   * Move the pill under the active link.
   *
   * Only `left` and `width` are animated. The pill is centred with
   * translateY(-50%), and animating `transform` would replace that outright,
   * dropping it half its own height mid-flight and snapping it back at the
   * end. If an independent transform is ever needed here, use the `translate`
   * and `scale` longhands, which compose instead of replacing.
   */
  const place = useCallback(() => {
    const list = listRef.current
    const pill = pillRef.current
    if (!list || !pill) return

    const active = list.querySelector('[data-active="true"]')
    if (!active) {
      pill.style.opacity = '0'
      return
    }

    const listRect = list.getBoundingClientRect()
    const rect = active.getBoundingClientRect()
    pill.style.opacity = '1'
    pill.style.left = `${rect.left - listRect.left}px`
    pill.style.width = `${rect.width}px`
  }, [])

  /*
   * Depends on `links` as well as on `path`.
   *
   * The pill is measured from the active link, and the labels are copy:
   * "Shop" is 47px and "Boutique" is 71px, so a language switch resizes the
   * thing the pill sits on without changing which thing it is. Without
   * `links` in the dependency list the pill keeps the previous language's
   * width and under-hangs the word.
   */
  useLayoutEffect(() => {
    place()
  }, [place, path, links])

  useEffect(() => {
    // The labels are text, so they reflow when the webfont lands.
    document.fonts?.ready.then(place)
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [place])

  /* Condense on the shared ticker rather than a private scroll listener, so
     the class flips in the same frame the rest of the page moves. */
  useEffect(() => {
    let condensed = false
    return onFrame((time, scrollY, moved) => {
      if (!moved) return
      const next = scrollY > CONDENSE_AT
      if (next === condensed) return
      condensed = next
      write(() => barRef.current?.classList.toggle('is-condensed', next))
    })
  }, [])

  /* The overlay covers everything, so put the page behind it to sleep. */
  useEffect(() => {
    freezeBackground(open)
    document.documentElement.classList.toggle('is-covered', open)
    return () => {
      freezeBackground(false)
      document.documentElement.classList.remove('is-covered')
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  /* A route change while the menu is open must close it, or the visitor
     lands on the new page with the overlay still covering it. */
  useEffect(() => setOpen(false), [path])

  const isActive = (linkPath) =>
    linkPath === '/' ? path === '/' : path === linkPath || path.startsWith(`${linkPath}/`)

  return (
    <>
      <header className="navbar" ref={barRef}>
        {/* The announcement strip. Folds away on scroll rather than
            disappearing, so the bar does not jump by its own height. */}
        <div className="navbar__strip">
          <div className="navbar__strip-inner">{t.topbar}</div>
        </div>

        <div className="navbar__bar">
          <div className="navbar__inner">
            <Link to="/" className="navbar__logo" aria-label={t.nav.home}>
              <Logo height={19} />
            </Link>

            <nav className="navbar__nav" aria-label={t.nav.menu}>
              <ul className="navbar__list" ref={listRef}>
                {/* The pill sits inside the list so it shares its coordinate
                    space; left/width are measured against the same box. */}
                <li className="navbar__indicator" ref={pillRef} aria-hidden="true" />
                {links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="navbar__link"
                      data-active={isActive(link.path)}
                      aria-current={isActive(link.path) ? 'page' : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="navbar__actions">
              <div className="navbar__lang" role="group" aria-label={t.nav.langLabel}>
                {LOCALES.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    className="navbar__lang-btn"
                    data-active={option.code === locale}
                    aria-pressed={option.code === locale}
                    onClick={() => setLocale(option.code)}
                  >
                    <span aria-hidden="true">{option.label}</span>
                    <span className="visually-hidden">{option.name}</span>
                  </button>
                ))}
              </div>

              {/*
                One button, showing the theme it will switch TO.
                A sun on a dark page and a moon on a light one is the
                convention every OS uses, and the aria-label says which so
                the icon is never the only thing carrying the meaning.
              */}
              <button
                type="button"
                className="navbar__theme"
                onClick={toggle}
                aria-label={resolved === 'dark' ? t.nav.themeToLight : t.nav.themeToDark}
              >
                {resolved === 'dark' ? <Sun /> : <Moon />}
              </button>

              <Link
                to="/boutique/panier"
                className="navbar__cart"
                aria-label={count ? t.nav.cartCount(count) : t.nav.cart}
              >
                <Bag />
                {count > 0 && (
                  <span className="navbar__badge" aria-hidden="true">
                    {count}
                  </span>
                )}
              </Link>

              <Link to="/rendez-vous" className="btn btn--primary navbar__cta">
                {t.nav.cta}
              </Link>

              <button
                type="button"
                className="navbar__burger"
                aria-expanded={open}
                aria-label={open ? t.nav.close : t.nav.menu}
                onClick={() => setOpen((current) => !current)}
              >
                <span className="navbar__burger-box" data-open={open}>
                  <span />
                  <span />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Rendered whether or not it is open, so the closing animation has
          something to run on. Inert when closed, so nothing inside it is
          reachable by keyboard or announced by a screen reader. */}
      <div className="menu" data-open={open} inert={!open}>
        <div className="menu__inner">
          <button type="button" className="menu__close" onClick={() => setOpen(false)}>
            <Close size={18} />
            <span>{t.nav.close}</span>
          </button>

          <ul className="menu__list">
            {links.map((link, index) => (
              <li key={link.path} style={{ '--i': index }}>
                <Link
                  to={link.path}
                  className="menu__link"
                  data-active={isActive(link.path)}
                  onNavigate={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="menu__foot">
            <Link to="/rendez-vous" className="btn btn--gold" onNavigate={() => setOpen(false)}>
              {t.nav.cta}
            </Link>
            <Link to={`tel:${t.shop.phones[0]}`} className="menu__phone">
              {t.shop.phones[0]}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
