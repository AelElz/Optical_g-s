import { useMemo, useRef } from 'react'
import { useContent } from '../content'
import products from '../data/products.json'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { usePanelStack } from '../hooks/usePanelStack'
import { useReveal } from '../hooks/useReveal'
import { useScrollProgress } from '../hooks/useScrollProgress'
import Footer from '../components/Footer'
import { ArrowDown, ArrowRight } from '../components/Icons'
import Kicker from '../components/Kicker'
import Link from '../components/Link'
import Panel from '../components/Panel'
import { Hours, MapEmbed, StoreCard } from '../components/StoreCard'
import { telHref } from '../lib/format'
import { whatsapp } from '../lib/forms'
import './Home.css'

/*
 * The hero frame.
 *
 * A real product from the real catalogue: the shop's own Versace, gold
 * rimmed, which is the one photograph in 542 whose subject is the brand
 * colour. Nothing on this page is a placeholder.
 */
const HERO_FRAME = { image: '/products/mod2274-1151.webp', brand: 'Versace', ref: 'MOD2274' }
const FOUNDER_FRAME = '/products/gg1862s-1158.webp'

/* Twelve frames for the strip, spread across the catalogue rather than taken
   from the front of it, so it is not twelve near-identical Hickmanns. */
function marqueeFrames() {
  const step = Math.floor(products.length / 12) || 1
  return Array.from({ length: 12 }, (_, i) => products[(i * step) % products.length])
}

export default function Home() {
  const t = useContent()
  const stackRef = useRef(null)
  usePanelStack(stackRef)

  const revealRef = useReveal()
  const heroRef = useScrollProgress({ smoothing: 5 })
  const craftRef = useScrollProgress({ smoothing: 4.5 })
  const founderRef = useScrollProgress({ smoothing: 4.5 })
  const marqueeRef = useScrollProgress({ smoothing: 7 })

  const frames = useMemo(marqueeFrames, [])

  /* Below this the seven columns of the hours strip stop being legible, and
     the panel stack is off anyway, so the chapter can afford the tall table. */
  const wide = useMediaQuery('(min-width: 620px)')

  const bookOnWhatsApp = whatsapp(t.shop.whatsapp, [
    [t.home.booking.title, t.shop.name],
    [t.rendezVous.fields.service, t.rendezVous.services[0].name],
  ])

  return (
    <div ref={revealRef}>
      <main id="top" ref={stackRef}>
        {/* ============ 1. Hero ======================================== */}
        <Panel tone="light" id="accueil" dwell="30svh" className="hero">
          <div className="container hero__grid" ref={heroRef}>
            <div className="hero__copy">
              <Kicker className="reveal">{t.home.hero.kicker}</Kicker>

              <h1 className="display hero__title">
                <span className="wipe">
                  <span>{t.home.hero.title}</span>
                </span>
              </h1>

              <span className="rule hero__rule" aria-hidden="true" />

              <p className="section-lede reveal" style={{ '--i': 1 }}>
                {t.home.hero.lede}
              </p>

              <div className="hero__actions reveal" style={{ '--i': 2 }}>
                <Link to="/rendez-vous" className="btn btn--primary">
                  <span>{t.home.hero.primary}</span>
                </Link>
                <Link to="/boutique" className="btn btn--ghost">
                  <span>{t.home.hero.secondary}</span>
                  <ArrowRight className="btn__icon" />
                </Link>
              </div>
            </div>

            {/*
              The frame drifts and settles as the chapter scrolls, and floats
              gently while it is still. Both are driven from CSS off --pd, so
              this element costs no JavaScript per frame of its own.
            */}
            <figure className="hero__product reveal" style={{ '--i': 1 }}>
              <img
                className="hero__frame"
                src={HERO_FRAME.image}
                alt={`${HERO_FRAME.brand} ${HERO_FRAME.ref}`}
                width="900"
                height="675"
                fetchPriority="high"
                decoding="async"
              />
              <figcaption className="hero__caption">
                <span className="label">{t.home.hero.frameLabel}</span>
                <span className="hero__caption-ref">
                  {HERO_FRAME.brand} {HERO_FRAME.ref}
                </span>
              </figcaption>
            </figure>
          </div>

          <div className="container hero__cue reveal" style={{ '--i': 3 }}>
            <span className="label">{t.home.hero.scroll}</span>
            <ArrowDown size={13} />
          </div>
        </Panel>

        {/* ============ 2. The store =================================== */}
        <Panel tone="white" id="magasin" dwell="60svh">
          <div className="container craft" ref={craftRef}>
            <div className="craft__copy">
              <Kicker className="reveal">{t.home.craft.kicker}</Kicker>
              <h2 className="section-title wipe">
                <span>{t.home.craft.title}</span>
              </h2>
              <p className="section-lede reveal" style={{ '--i': 1 }}>
                {t.home.craft.body}
              </p>
            </div>

            {/*
              Three photographs on their own parallax rates. The offsets are
              small on purpose: a large one turns a wall of photographs into a
              slideshow, and the point is depth, not movement.
            */}
            <div className="craft__photos">
              {t.home.craft.photos.map((photo, index) => (
                <figure
                  className="craft__photo reveal"
                  key={photo.src}
                  style={{ '--i': index, '--rate': [0.5, -0.85, 0.3][index] }}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    width="1400"
                    height="1050"
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
              ))}
            </div>

            {/* Spans both columns: seven days want the full width. */}
            <div className="craft__hours reveal" style={{ '--i': 2 }}>
              <Hours layout={wide ? 'row' : 'stack'} />
            </div>
          </div>
        </Panel>

        {/* ============ 3. Services. The first gold chapter. =========== */}
        <Panel tone="gold" id="services" dwell="55svh">
          <div className="container services">
            <header className="services__head">
              <Kicker className="reveal">{t.home.services.kicker}</Kicker>
              <h2 className="section-title wipe">
                <span>{t.home.services.title}</span>
              </h2>
              <p className="section-lede reveal" style={{ '--i': 1 }}>
                {t.home.services.lede}
              </p>
            </header>

            <ul className="services__list">
              {t.home.services.items.map((item, index) => (
                /* Keyed on `n`, not on the name. The name is copy, so keying
                   on it unmounts and remounts every row on a language switch
                   and replays the whole chapter's enter animation. */
                <li key={item.n} className="reveal" style={{ '--i': index % 3 }}>
                  <Link to="/rendez-vous" className="reveal-row services__row">
                    <span className="reveal-row__fill" aria-hidden="true" />
                    <span className="reveal-row__text services__row-text">
                      <span className="services__n tnum" aria-hidden="true">
                        {String(item.n).padStart(2, '0')}
                      </span>
                      <span className="services__name">{item.name}</span>
                      <span className="services__note">{item.note}</span>
                      <span className="services__duration tnum">{item.duration}</span>
                      <ArrowRight className="services__arrow" size={15} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        {/* ============ 4. The founder ================================= */}
        <Panel tone="light" id="fondatrice" dwell="45svh">
          <div className="container founder" ref={founderRef}>
            <figure className="founder__media reveal">
              <img
                className="founder__portrait"
                src="/media/founder.webp"
                alt={t.home.founder.photoAlt}
                width="583"
                height="729"
                loading="lazy"
                decoding="async"
              />
              <img
                className="founder__frame"
                src={FOUNDER_FRAME}
                alt=""
                aria-hidden="true"
                width="900"
                height="675"
                loading="lazy"
                decoding="async"
              />
            </figure>

            <div className="founder__copy">
              <Kicker className="reveal">{t.home.founder.kicker}</Kicker>
              <h2 className="section-title wipe">
                <span>{t.home.founder.name}</span>
              </h2>
              <p className="section-lede reveal" style={{ '--i': 1 }}>
                {t.home.founder.body}
              </p>
              <p className="founder__link reveal" style={{ '--i': 2 }}>
                <Link to="/a-propos" className="link-arrow">
                  <span>{t.home.founder.link}</span>
                  <ArrowRight size={13} />
                </Link>
              </p>
            </div>
          </div>
        </Panel>

        {/* ============ 5. The one ink chapter ========================= */}
        <Panel tone="ink" id="rendez-vous" dwell="35svh">
          <div className="container container--narrow booking">
            <Kicker className="kicker--center reveal">{t.home.booking.kicker}</Kicker>
            <h2 className="display booking__title">
              <span className="wipe">
                <span>{t.home.booking.title}</span>
              </span>
            </h2>
            <p className="section-lede reveal" style={{ '--i': 1 }}>
              {t.home.booking.lede}
            </p>
            <div className="booking__actions reveal" style={{ '--i': 2 }}>
              <Link to="/rendez-vous" className="btn btn--primary">
                <span>{t.home.booking.primary}</span>
              </Link>
              <Link to={bookOnWhatsApp} className="btn btn--ghost">
                <span>{t.home.booking.secondary}</span>
              </Link>
            </div>
          </div>
        </Panel>

        {/* ============ 6. Find us ===================================== */}
        <Panel tone="white" id="contact" dwell="40svh">
          <div className="container find">
            <div className="find__copy">
              <Kicker className="reveal">{t.home.find.kicker}</Kicker>
              <h2 className="section-title wipe">
                <span>{t.home.find.title}</span>
              </h2>
              <div className="find__store reveal" style={{ '--i': 1 }}>
                <StoreCard />
              </div>
              <div className="find__actions reveal" style={{ '--i': 2 }}>
                <Link to={telHref(t.shop.phones[0])} className="btn btn--primary">
                  <span>{t.home.find.call}</span>
                </Link>
                <Link to="/contact" className="btn btn--ghost">
                  <span>{t.nav.links[4].label}</span>
                  <ArrowRight className="btn__icon" />
                </Link>
              </div>
            </div>

            <div className="find__map reveal" style={{ '--i': 1 }}>
              <MapEmbed label={t.home.find.mapLabel} />
            </div>
          </div>
        </Panel>

        {/* ============ 7. The shop. Gold, and the last chapter. ======= */}
        <Panel tone="gold" id="boutique" dwell="0svh">
          <div className="shop-teaser">
            <div className="container shop-teaser__copy">
              <Kicker className="reveal">{t.home.shopTeaser.kicker}</Kicker>
              <h2 className="display shop-teaser__title">
                <span className="wipe">
                  <span>{t.home.shopTeaser.title}</span>
                </span>
              </h2>
              <p className="section-lede reveal" style={{ '--i': 1 }}>
                {t.home.shopTeaser.lede}
              </p>
              <div className="shop-teaser__actions reveal" style={{ '--i': 2 }}>
                <Link to="/boutique" className="btn btn--primary">
                  <span>{t.home.shopTeaser.cta}</span>
                  <ArrowRight className="btn__icon" />
                </Link>
                <span className="label shop-teaser__count tnum">
                  {t.home.shopTeaser.count(products.length)}
                </span>
              </div>
            </div>

            {/*
              A strip of real frames that travels sideways as the chapter
              scrolls. Scroll-linked rather than a looping animation: it moves
              because you are moving, which is what stops it reading as a
              banner advert.
            */}
            <div className="marquee" ref={marqueeRef} aria-hidden="true">
              <div className="marquee__track">
                {frames.map((frame) => (
                  <span className="marquee__item" key={frame.id}>
                    <img src={frame.image} alt="" width="900" height="675" loading="lazy" decoding="async" />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </main>

      <Footer />
    </div>
  )
}
