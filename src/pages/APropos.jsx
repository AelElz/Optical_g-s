import { useMemo } from 'react'
import { useContent } from '../content'
import products from '../data/products.json'
import { useReveal } from '../hooks/useReveal'
import FocusText from '../components/FocusText'
import Footer from '../components/Footer'
import Heading from '../components/Heading'
import { ArrowRight, Mark } from '../components/Icons'
import Kicker from '../components/Kicker'
import Link from '../components/Link'
import PageHead from '../components/PageHead'
import { StoreCard } from '../components/StoreCard'
import { telHref } from '../lib/format'
import './APropos.css'

/* Four frames to sit under the selection list: real products, hand-picked
   from photographs that are clean cut-outs on white. */
const SELECTION_IMAGES = [
  '/products/gg2153o-1159.webp',
  '/products/fe40216u-14a-1136.webp',
  '/products/hi6416-1166.webp',
  '/products/mod-2231-515.webp',
]

const pickFrames = () =>
  SELECTION_IMAGES.map((image) => products.find((p) => p.image === image)).filter(Boolean)

export default function APropos() {
  const t = useContent()
  const revealRef = useReveal()
  const copy = t.aPropos
  const frames = useMemo(pickFrames, [])

  return (
    <div ref={revealRef}>
      <main id="top" className="about">
        <PageHead kicker={copy.kicker} title={copy.title} />

        {/* The intro, coming into focus: this page's one authored moment. */}
        <section className="about-intro" data-surface="ink">
          <div className="container section-grid">
            <span aria-hidden="true" />
            <FocusText text={copy.intro} className="about-intro__text" />
          </div>
        </section>

        {/* The four commitments, as a ruled list rather than a card grid. */}
        <section className="about-why section" data-surface="white">
          <div className="container">
            <div className="section-grid about-why__head">
              <Kicker className="reveal">{copy.whyKicker}</Kicker>
              <Heading className="h2" text={copy.whyTitle} />
            </div>

            <ul className="about-why__list">
              {copy.why.map((item, index) => (
                /* Keyed on `n`, not on the title: the title is copy. */
                <li key={item.n} className="about-why__row reveal" style={{ '--i': index % 4 }}>
                  <h3 className="about-why__title">
                    <span className="lens-dot" aria-hidden="true" />
                    {item.title}
                  </h3>
                  <p className="about-why__body">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* The selection: this page's gold stage. */}
        <section className="about-selection section" data-surface="gold">
          <div className="container">
            <div className="section-grid">
              <Kicker className="reveal">{copy.selectionKicker}</Kicker>
              <div className="about-selection__body">
                <Heading className="display" text={copy.selectionTitle} />
                <ul className="about-selection__list">
                  {copy.selection.map((item, index) => (
                    <li key={item.n} className="reveal" style={{ '--i': index % 3 }}>
                      <Mark height={12} className="about-selection__mark" />
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="about-selection__plates reveal">
              {frames.map((frame) => (
                <figure className="about-selection__plate" key={frame.id}>
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
        </section>

        {/* The store */}
        <section className="about-store section" data-surface="ink">
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

            <div className="about-store__copy">
              <Kicker className="reveal">{copy.storeKicker}</Kicker>
              <Heading className="h2" text={copy.storeTitle} />
              <p className="about-store__name reveal" style={{ '--i': 1 }}>
                {copy.storeName}
              </p>
              <div className="reveal" style={{ '--i': 2 }}>
                <StoreCard />
              </div>
              <div className="actions reveal" style={{ '--i': 3 }}>
                <Link to="/boutique" className="btn btn--primary">
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
