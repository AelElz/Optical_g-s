import { useContent } from '../content'
import { formatPhone, telHref } from '../lib/format'
import { scrollTo } from '../lib/motion'
import { ArrowRight, socialIcons } from './Icons'
import Link from './Link'
import Logo from './Logo'
import './Footer.css'

/*
 * The Devorise footer: links in a row, then the name set as large as the
 * page allows, with the store's own interior showing through the letters.
 * The wordmark is an image of the name (aria-hidden); the logo above it is
 * what a screen reader gets.
 */
export default function Footer() {
  const t = useContent()
  const { shop, footer, nav } = t

  return (
    <footer className="footer" data-surface="deep">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <Link to="/" className="footer__logo" aria-label={nav.home}>
              <Logo height={22} />
            </Link>
            <p className="footer__tagline">{shop.tagline}</p>
          </div>

          <nav className="footer__col" aria-labelledby="footer-links">
            <h2 className="footer__title" id="footer-links">
              {footer.linksTitle}
            </h2>
            <ul className="footer__list">
              {nav.links.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/boutique/panier" className="footer__link">
                  {nav.cart}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="footer__col">
            <h2 className="footer__title">{footer.contactTitle}</h2>
            <ul className="footer__list">
              <li>
                <Link to={shop.mapsUrl} className="footer__link footer__address">
                  {shop.address}
                </Link>
              </li>
              {shop.phones.map((phone) => (
                <li key={phone}>
                  <Link to={telHref(phone)} className="footer__link tnum">
                    {formatPhone(phone)}
                  </Link>
                </li>
              ))}
              <li>
                <Link to={`mailto:${shop.email}`} className="footer__link">
                  {shop.email}
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer__col">
            <h2 className="footer__title">{footer.socialTitle}</h2>
            <ul className="footer__social">
              {shop.social.map((item) => {
                const Icon = socialIcons[item.name]
                return (
                  <li key={item.name}>
                    <Link to={item.url} className="footer__social-link" aria-label={item.name}>
                      {Icon ? <Icon /> : item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
            <p className="footer__hours">{shop.closedNote}</p>
          </div>
        </div>

        <p className="footer__wordmark" aria-hidden="true">
          Optical G&amp;S
        </p>

        <div className="footer__base">
          <p>{footer.rights}</p>
          <p>{footer.credit}</p>
          <button
            type="button"
            className="footer__up"
            onClick={() => scrollTo('#top', { immediate: false })}
          >
            {footer.top}
            <ArrowRight className="footer__up-icon" size={13} />
          </button>
        </div>
      </div>
    </footer>
  )
}
