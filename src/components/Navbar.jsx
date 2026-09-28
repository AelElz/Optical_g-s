import { useEffect, useRef, useState } from 'react'
import { useContent } from '../content'
import { useCart } from '../lib/cart-context'
import { LOCALES, useLocale } from '../lib/locale-context'
import { freezeBackground, onFrame, write } from '../lib/motion'
import { useRouter } from '../lib/router-context'
import { ArrowRight, Bag } from './Icons'
import Link from './Link'
import Logo from './Logo'
import './Navbar.css'

/* Past this the bar takes the colour of the section beneath it. */
const CONDENSE_AT = 24

/*
 * The surface under the header's midline.
 *
 * Every section declares data-surface. The last match in document order is
 * the deepest one (a card inside a section comes after the section), which is
 * the colour actually showing behind the bar. The header then wears that
 * surface itself, so its tokens flip with no colour rules of its own: white
 * over the ink stage, ink over the gold one and the stone floors.
 */
let surfaces = null

/* The list changes only when the page does; re-query it then, not per frame. */
const resetSurfaces = () => {
  surfaces = null
}

function surfaceAt(y) {
  // A page can swap its own sections (the cart empties, for one), so a list
  // holding a detached node is re-read.
  if (surfaces && !surfaces.every((el) => el.isConnected)) surfaces = null
  surfaces ??= [
    ...document.querySelectorAll('main[data-surface], main [data-surface], footer[data-surface]'),
  ]
  let found = 'ink'
  for (const el of surfaces) {
    const rect = el.getBoundingClientRect()
    if (rect.top <= y && rect.bottom > y) found = el.dataset.surface
  }
  return found
}

export default function Navbar() {
  const t = useContent()
  const { path } = useRouter()
  const { count } = useCart()
  const { locale, setLocale } = useLocale()

  const [open, setOpen] = useState(false)
  const barRef = useRef(null)

  const { links } = t.nav

  useEffect(() => {
    let condensed = null
    let tone = null
    let first = true
    return onFrame((time, scrollY, moved) => {
      if (!moved && !first) return
      first = false
      const bar = barRef.current
      if (!bar) return
      const nextCondensed = scrollY > CONDENSE_AT
      const nextTone = surfaceAt(bar.offsetHeight / 2)
      if (nextCondensed === condensed && nextTone === tone) return
      condensed = nextCondensed
      tone = nextTone
      write(() => {
        bar.classList.toggle('is-condensed', nextCondensed)
        bar.dataset.surface = nextTone
      })
    })
  }, [])

  /* A new page starts on a new surface; re-read it once the page has painted. */
  useEffect(() => {
    resetSurfaces()
    const frame = requestAnimationFrame(() => {
      resetSurfaces()
      const bar = barRef.current
      if (bar) bar.dataset.surface = surfaceAt(bar.offsetHeight / 2)
    })
    return () => cancelAnimationFrame(frame)
  }, [path])

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

  /* A route change while the menu is open must close it. */
  useEffect(() => setOpen(false), [path])

  const isActive = (linkPath) =>
    linkPath === '/' ? path === '/' : path === linkPath || path.startsWith(`${linkPath}/`)

  const languages = (
    <div className="lang" role="group" aria-label={t.nav.langLabel}>
      {LOCALES.map((option) => (
        <button
          key={option.code}
          type="button"
          className="lang__btn"
          data-active={option.code === locale}
          aria-pressed={option.code === locale}
          onClick={() => setLocale(option.code)}
        >
          <span aria-hidden="true">{option.label}</span>
          <span className="visually-hidden">{option.name}</span>
        </button>
      ))}
    </div>
  )

  return (
    <>
      <a className="skip-link" href="#top">
        {t.nav.skip}
      </a>

      <header className="header" ref={barRef} data-surface="ink">
        <div className="container header__inner">
          <Link to="/" className="header__logo" aria-label={t.nav.home}>
            <Logo height={18} />
          </Link>

          <nav className="header__nav" aria-label={t.nav.menu}>
            <ul className="header__list">
              {links.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="header__link"
                    data-active={isActive(link.path)}
                    aria-current={isActive(link.path) ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header__actions">
            <div className="header__lang">{languages}</div>

            <Link
              to="/boutique/panier"
              className="header__cart"
              aria-label={count ? t.nav.cartCount(count) : t.nav.cart}
            >
              <Bag size={19} />
              {count > 0 && (
                <span className="header__badge tnum" aria-hidden="true">
                  {count}
                </span>
              )}
            </Link>

            <Link to="/boutique" className="btn btn--primary btn--sm header__cta">
              <span>{t.home.hero.secondary}</span>
            </Link>

            <button
              type="button"
              className="header__burger"
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? t.nav.close : t.nav.menu}
              onClick={() => setOpen((current) => !current)}
            >
              <span className="header__burger-lines" data-open={open}>
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/*
        The Devorise menu: a near-black room, the page names large, and a
        dotted rail down the left with a gold point on the current page.
        Rendered whether or not it is open so the closing animation has
        something to run on; inert when closed.
      */}
      <div className="menu" id="site-menu" data-surface="deep" data-open={open} inert={!open}>
        <div className="container menu__inner">
          <nav aria-label={t.nav.menu}>
            <ul className="menu__list">
              {links.map((link, index) => (
                <li key={link.path} style={{ '--i': index }}>
                  <Link
                    to={link.path}
                    className="menu__link"
                    data-active={isActive(link.path)}
                    aria-current={isActive(link.path) ? 'page' : undefined}
                    onNavigate={() => setOpen(false)}
                  >
                    <span className="menu__point" aria-hidden="true" />
                    <span className="menu__label">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="menu__foot">
            <Link to="/boutique/panier" className="menu__cart" onNavigate={() => setOpen(false)}>
              <Bag size={18} />
              <span>{count ? t.nav.cartCount(count) : t.nav.cart}</span>
            </Link>
            <Link to="/rendez-vous" className="btn btn--primary" onNavigate={() => setOpen(false)}>
              <span>{t.nav.cta}</span>
              <ArrowRight className="btn__icon" />
            </Link>
            {languages}
            <p className="menu__note">{t.topbar}</p>
          </div>
        </div>
      </div>
    </>
  )
}
