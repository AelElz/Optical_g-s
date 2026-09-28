import { useMemo, useState } from 'react'
import { useContent } from '../content'
import products from '../data/products.json'
import { useReveal } from '../hooks/useReveal'
import { useScrollProgress } from '../hooks/useScrollProgress'
import FocusText from '../components/FocusText'
import Footer from '../components/Footer'
import Heading from '../components/Heading'
import HeroLens from '../components/HeroLens'
import { ArrowRight, ArrowUpRight } from '../components/Icons'
import Kicker from '../components/Kicker'
import Link from '../components/Link'
import ProductCard from '../components/ProductCard'
import QuickView from '../components/QuickView'
import { Hours, MapEmbed, StoreCard } from '../components/StoreCard'
import Ticker from '../components/Ticker'
import { telHref } from '../lib/format'
import { whatsapp } from '../lib/forms'
import './Home.css'

/*
 * The frames the hero lens cycles through. Real catalogue products, chosen
 * because their photographs are clean cut-outs on white that sit well in a
 * round plate; the gold Versace leads because its subject is the brand colour.
 */
const LENS_IMAGES = [
  '/products/mod2274-1151.webp',
  '/products/gg1862s-1158.webp',
  '/products/dior-cannage-1154.webp',
  '/products/b23-514.webp',
  '/products/gg2153o-1159.webp',
]

/*
 * The houses in the ticker: labels the shop actually stocks (see the brand
 * field in products.json), written as the houses write their own names.
 */
const HOUSES = [
  'Gucci',
  'Dior',
  'Prada',
  'Versace',
  'Fendi',
  'Bvlgari',
  'Celine',
  'Givenchy',
  'Miu Miu',
  'Bottega Veneta',
  'Saint Laurent',
  'Vogue',
  'Guess',
]

/*
 * Ten frames for the home rail, hand-picked from photographs checked to be
 * clean cut-outs on white (a few catalogue shots are on a grey studio ground
 * and break the row of plates). Anything sold out or unpriced drops out.
 */
const RAIL_IMAGES = [
  '/products/ah1597-1167.webp',
  '/products/gg1862s-1158.webp',
  '/products/b23-514.webp',
  '/products/dior-cannage-1154.webp',
  '/products/hi6416-1166.webp',
  '/products/gg2059s-1155.webp',
  '/products/fe40216u-14a-1136.webp',
  '/products/mod-2231-515.webp',
  '/products/dior-glow-b3i-1137.webp',
  '/products/gg2153o-1159.webp',
]

function railFrames() {
  return RAIL_IMAGES.map((image) => products.find((p) => p.image === image)).filter(
    (product) => product && product.stock && product.price,
  )
}

const categoryHref = ({ genre, type }) => {
  const params = new URLSearchParams()
  if (genre !== 'all') params.set('genre', genre)
  if (type !== 'all') params.set('type', type)
  const query = params.toString()
  return `/boutique${query ? `?${query}` : ''}#frames`
}

export default function Home() {
  const t = useContent()
  const { home, boutique } = t
  const revealRef = useReveal()
  const bandsRef = useScrollProgress({ smoothing: 6 })
  const photosRef = useScrollProgress({ smoothing: 5 })
  const [opened, setOpened] = useState(null)

  const lensFrames = useMemo(
    () => LENS_IMAGES.map((image) => products.find((p) => p.image === image)).filter(Boolean),
    [],
  )
  const rail = useMemo(railFrames, [])

  const bookOnWhatsApp = whatsapp(t.shop.whatsapp, [
    [home.booking.title, t.shop.name],
    [t.rendezVous.fields.service, t.rendezVous.services[0].name],
  ])

  return (
    <div ref={revealRef}>
      <main id="top">
        {/* ============ Hero: the ink stage and the lens ================ */}
        <section className="hero" data-surface="ink">
          <div className="container hero__grid">
            <div className="hero__copy">
              <Kicker className="reveal">{home.hero.kicker}</Kicker>
              <Heading
                as="h1"
                className="display hero__title"
                text={home.hero.title}
                accent={home.hero.accent}
              />
              <p className="lead reveal" style={{ '--i': 1 }}>
                {home.hero.lede}
              </p>
              <div className="actions reveal" style={{ '--i': 2 }}>
                <Link to="/boutique" className="btn btn--primary">
                  <span>{home.hero.secondary}</span>
                  <ArrowRight className="btn__icon" />
                </Link>
                <Link to="/rendez-vous" className="btn btn--ghost">
                  <span>{home.hero.primary}</span>
                </Link>
              </div>
            </div>

            <div className="hero__lens reveal" style={{ '--i': 1 }}>
              <HeroLens
                frames={lensFrames}
                label={home.hero.frameLabel}
                pauseLabel={home.hero.pause}
                playLabel={home.hero.play}
                measurementsLabel={boutique.quickView.measurements}
              />
            </div>
          </div>

          <div className="container">
            <ul className="hero__meta reveal" style={{ '--i': 3 }}>
              <li>
                <span className="lens-dot" aria-hidden="true" />
                {t.shop.city}
              </li>
              <li className="tnum">
                <span className="lens-dot" aria-hidden="true" />
                {home.shopTeaser.count(products.length)}
              </li>
              <li>
                <span className="lens-dot" aria-hidden="true" />
                {t.panier.payment}
              </li>
            </ul>
          </div>
        </section>

        {/* ============ Ticker: the houses ============================== */}
        <section data-surface="ink">
          <Ticker items={HOUSES} pauseLabel={home.hero.pause} playLabel={home.hero.play} />
        </section>

        {/* ============ Statement: the store, coming into focus ========= */}
        <section className="statement section" data-surface="ink">
          <div className="container section-grid">
            <Kicker className="reveal">{home.craft.kicker}</Kicker>
            <div className="statement__body">
              <h2 className="visually-hidden">{home.craft.title}</h2>
              <FocusText text={home.craft.body} className="statement__text" />
              <div className="statement__foot">
                <span className="rule-dotted" aria-hidden="true" />
                <Link to="/a-propos" className="link-arrow">
                  <span>{home.founder.link}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>

          <div className="container statement__photos" ref={photosRef}>
            {home.craft.photos.map((photo, index) => (
              <figure
                className="statement__photo reveal"
                key={photo.src}
                style={{ '--i': index, '--rate': [0.6, -0.4, 0.9][index] }}
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
        </section>

        {/* ============ Categories ====================================== */}
        <section className="cats section" data-surface="white">
          <div className="container">
            <div className="section-grid cats__head">
              <Kicker className="reveal">{boutique.categories.kicker}</Kicker>
              <Heading className="h2" text={boutique.categories.title} />
            </div>

            <ul className="cats__grid">
              {boutique.categories.items.map((category, index) => (
                <li key={category.key} className="reveal" style={{ '--i': index % 3 }}>
                  <Link to={categoryHref(category)} className="cats__tile">
                    <img
                      src={`/media/cat-${category.key}.webp`}
                      alt=""
                      width="900"
                      height="675"
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="cats__label">
                      <span>{category.label}</span>
                      <ArrowUpRight size={20} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ============ The rail: buy from the home page =============== */}
        <section className="rail section" data-surface="stone">
          <div className="container">
            <div className="section-grid rail__head">
              <Kicker className="reveal">{home.shopTeaser.kicker}</Kicker>
              <div className="rail__intro">
                <Heading className="h2" text={home.shopTeaser.title} />
                <div className="rail__aside reveal" style={{ '--i': 1 }}>
                  <p className="lead">{home.shopTeaser.lede}</p>
                  <Link to="/boutique" className="btn btn--primary">
                    <span>{home.shopTeaser.cta}</span>
                    <ArrowRight className="btn__icon" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="rail__track" tabIndex={0} aria-label={home.shopTeaser.title}>
            <ul className="rail__list">
              {rail.map((product, index) => (
                <li key={product.id} className="rail__item">
                  <ProductCard product={product} index={index + 4} onOpen={setOpened} />
                </li>
              ))}
              <li className="rail__item rail__item--more">
                <Link to="/boutique" className="rail__more">
                  <span className="rail__more-count tnum">{products.length}</span>
                  <span>{home.shopTeaser.count(products.length)}</span>
                  <ArrowUpRight size={22} />
                </Link>
              </li>
            </ul>
          </div>
        </section>

        {/* ============ The gold stage ================================== */}
        <section className="stage" data-surface="gold" id="services">
          <div className="container section-grid stage__inner">
            <Kicker className="reveal">{home.services.kicker}</Kicker>
            <div className="stage__body">
              <Heading className="display stage__title" text={home.services.title} />
              <p className="lead reveal" style={{ '--i': 1 }}>
                {home.services.lede}
              </p>
            </div>
          </div>
        </section>

        {/*
          The Devorise hand-off: gold bands that thin and close as the white
          section rises through them. Decorative; the section order carries
          the meaning.
        */}
        <div className="bands" ref={bandsRef} aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <span className="bands__band" key={i} style={{ '--b': i }} />
          ))}
        </div>

        {/* ============ The service deck ================================ */}
        <section className="deck" data-surface="white">
          <div className="container">
            <ul className="deck__list">
              {home.services.items.map((item, index) => (
                <li key={item.n} className="deck__item" style={{ '--i': index }}>
                  <Link to="/rendez-vous" className="deck__card">
                    <span className="deck__main">
                      <span className="deck__name">{item.name}</span>
                      <span className="deck__note">{item.note}</span>
                    </span>
                    <span className="deck__side">
                      {item.duration && <span className="deck__duration tnum">{item.duration}</span>}
                      <ArrowUpRight className="deck__arrow" size={26} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ============ Founder and booking ============================= */}
        <section className="founder section" data-surface="ink" id="rendez-vous">
          <div className="container founder__grid">
            <figure className="founder__media reveal">
              <img
                src="/media/founder.webp"
                alt={home.founder.photoAlt}
                width="583"
                height="729"
                loading="lazy"
                decoding="async"
              />
            </figure>

            <div className="founder__copy">
              <Kicker className="reveal">{home.founder.kicker}</Kicker>
              <Heading className="h2" text={home.founder.name} />
              <p className="founder__body reveal" style={{ '--i': 1 }}>
                {home.founder.body}
              </p>
              <p className="reveal" style={{ '--i': 2 }}>
                <Link to="/a-propos" className="link-arrow">
                  <span>{home.founder.link}</span>
                  <ArrowRight size={13} />
                </Link>
              </p>
            </div>
          </div>

          <div className="container booking">
            <div className="section-grid">
              <Kicker className="reveal">{home.booking.kicker}</Kicker>
              <div className="booking__body">
                <Heading className="display booking__title" text={home.booking.title} />
                <p className="lead reveal" style={{ '--i': 1 }}>
                  {home.booking.lede}
                </p>
                <div className="actions reveal" style={{ '--i': 2 }}>
                  <Link to="/rendez-vous" className="btn btn--primary">
                    <span>{home.booking.primary}</span>
                    <ArrowRight className="btn__icon" />
                  </Link>
                  <Link to={bookOnWhatsApp} className="btn btn--ghost">
                    <span>{home.booking.secondary}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ Find us ========================================= */}
        <section className="find section" data-surface="stone" id="contact">
          <div className="container">
            <div className="section-grid find__head">
              <Kicker className="reveal">{home.find.kicker}</Kicker>
              <Heading className="h2" text={home.find.title} />
            </div>

            <div className="find__grid">
              <div className="find__info reveal">
                <StoreCard />
                <Hours compact />
                <div className="actions">
                  <Link to={telHref(t.shop.phones[0])} className="btn btn--primary">
                    <span>{home.find.call}</span>
                  </Link>
                  <Link to="/contact" className="btn btn--ghost">
                    <span>{t.nav.links[4].label}</span>
                    <ArrowRight className="btn__icon" />
                  </Link>
                </div>
              </div>
              <div className="find__map reveal" style={{ '--i': 1 }}>
                <MapEmbed label={home.find.mapLabel} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <QuickView product={opened} onClose={() => setOpened(null)} />
      <Footer />
    </div>
  )
}
