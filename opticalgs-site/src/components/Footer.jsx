import { useContent } from '../content'
import { formatPhone, telHref } from '../lib/format'
import { scrollTo } from '../lib/motion'
import { ArrowRight, Mail, Phone, Pin, socialIcons } from './Icons'
import Link from './Link'
import Logo from './Logo'
import './Footer.css'

export default function Footer() {
  const t = useContent()
  const { shop, footer, nav } = t

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__logo" aria-label={nav.home}>
            <Logo height={24} />
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
          <ul className="footer__list footer__list--contact">
            <li>
              <Link to={shop.mapsUrl} className="footer__link footer__link--icon">
                <Pin />
                <span>{shop.address}</span>
              </Link>
            </li>
            {shop.phones.map((phone) => (
              <li key={phone}>
                <Link to={telHref(phone)} className="footer__link footer__link--icon">
                  <Phone />
                  <span className="footer__num">{formatPhone(phone)}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link to={`mailto:${shop.email}`} className="footer__link footer__link--icon">
                <Mail />
                <span>{shop.email}</span>
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

      <div className="container footer__base">
        <p className="footer__rights">{footer.rights}</p>
        <p className="footer__credit">{footer.credit}</p>
        <button
          type="button"
          className="footer__top"
          onClick={() => scrollTo('#top', { immediate: false })}
        >
          {footer.top}
          <ArrowRight className="footer__top-icon" />
        </button>
      </div>
    </footer>
  )
}
