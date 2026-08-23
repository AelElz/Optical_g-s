import { useMemo, useRef } from 'react'
import { useContent } from '../content'
import products from '../data/products.json'
import { useReveal } from '../hooks/useReveal'
import { useScrollProgress } from '../hooks/useScrollProgress'
import Footer from '../components/Footer'
import Kicker from '../components/Kicker'
import { ArrowRight, Mark } from '../components/Icons'
import Link from '../components/Link'
import { StoreCard } from '../components/StoreCard'
import { telHref } from '../lib/format'
import './Forms.css'
import './APropos.css'

/* Four frames from across the catalogue to sit beside the selection list.
   Real products, not a stock photograph of "eyewear". */
function pickFrames() {
  const step = Math.floor(products.length / 4) || 1
  return Array.from({ length: 4 }, (_, i) => products[(i * step + 3) % products.length])
}

export default function APropos() {
  const t = useContent()
  const revealRef = useReveal()
  const storeRef = useScrollProgress({ smoothing: 5 })
  const copy = t.aPropos
  const frames = useMemo(pickFrames, [])

  return (
    <div ref={revealRef}>
      <main id="top" className="page page--light">
        <section className="page__head">
          <div className="container">
            <Kicker className="reveal">{copy.kicker}</Kicker>
            <h1 className="display page__title">
              <span className="wipe">
                <span>{copy.title}</span>
              </span>
            </h1>
            <span className="rule page__rule" aria-hidden="true" />
          </div>
        </section>

        <section className="container about-intro">
          <p className="about-intro__text reveal">{copy.intro}</p>
        </section>

        {/* Why choose us */}
        <section className="about-why">
          <div className="container">
            <Kicker className="reveal">{copy.whyKicker}</Kicker>
            <h2 className="section-title about-why__title wipe">
              <span>{copy.whyTitle}</span>
            </h2>

            <ul className="about-why__grid">
              {copy.why.map((item, index) => (
                /* Keyed on `n`, not on the title: the title is copy, and
                   keying on it would remount every card on a language
                   switch and replay the whole section's enter animation. */
                <li key={item.n} className="reveal" style={{ '--i': index % 3 }}>
                  {/* The first tile is the gold one, and the class is what
                      re-scopes the foreground tokens for it. */}
                  <article
                    className={`about-why__card${index === 0 ? ' about-why__card--gold' : ''}`}
                  >
                    <span className="about-why__n" aria-hidden="true">
                      {String(item.n).padStart(2, '0')}
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Selection */}
        <section className="about-selection">
          <div className="container about-selection__inner">
            <div>
              <Kicker className="reveal">{copy.selectionKicker}</Kicker>
              <h2 className="section-title wipe">
                <span>{copy.selectionTitle}</span>
              </h2>
              <div className="about-selection__photos reveal" style={{ '--i': 1 }}>
                {frames.map((frame) => (
                  <figure className="about-selection__photo" key={frame.id}>
                    <img
                      src={frame.image}
                      alt={`${frame.brand} ${frame.ref}`}
                      width="900"
                      height="675"
                      loading="lazy"
                      decoding="async"
                    />
                  </figure>
                ))}
              </div>
            </div>

            <ul className="about-selection__list">
              {copy.selection.map((item, index) => (
                <li key={item.n} className="reveal" style={{ '--i': index % 3 }}>
                  <span className="about-selection__row">
                    <Mark height={12} className="about-selection__mark" />
                    <span>{item.label}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* The store */}
        <section className="about-store section--ink" ref={storeRef}>
          <div className="container about-store__grid">
            <figure className="about-store__photo reveal">
              <img
                src="/media/store-1.webp"
                alt={t.home.craft.photos[0].alt}
                width="1400"
                height="1050"
                loading="lazy"
                decoding="async"
              />
            </figure>

            <div>
              <Kicker className="reveal">{copy.storeKicker}</Kicker>
              <h2 className="section-title wipe">
                <span>{copy.storeTitle}</span>
              </h2>
              <p className="about-store__name reveal" style={{ '--i': 1 }}>
                {copy.storeName}
              </p>
              <div className="reveal" style={{ '--i': 2 }}>
                <StoreCard tone="ink" />
              </div>
              <div className="about-store__actions reveal" style={{ '--i': 3 }}>
                <Link to="/boutique" className="btn btn--gold">
                  <span>{copy.cta}</span>
                  <ArrowRight className="btn__icon" />
                </Link>
                <Link to={telHref(t.shop.phones[0])} className="btn btn--ghost">
                  <span>{t.contact.call}</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
