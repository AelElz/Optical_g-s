import { useContent } from '../content'
import { useReveal } from '../hooks/useReveal'
import Footer from '../components/Footer'
import Heading from '../components/Heading'
import { ArrowRight, Mark } from '../components/Icons'
import Kicker from '../components/Kicker'
import Link from '../components/Link'
import './NotFound.css'

export default function NotFound() {
  const t = useContent()
  const revealRef = useReveal()

  return (
    <div ref={revealRef}>
      <main id="top" className="notfound" data-surface="ink">
        <div className="container notfound__inner">
          {/* The mark, blurred: a page that is not there, out of focus. */}
          <Mark height={120} className="notfound__mark" />
          <Kicker className="reveal">{t.notFound.kicker}</Kicker>
          <Heading as="h1" className="display notfound__title" text={t.notFound.title} />
          <p className="lead reveal" style={{ '--i': 1 }}>
            {t.notFound.lede}
          </p>
          <div className="actions reveal" style={{ '--i': 2 }}>
            <Link to="/" className="btn btn--primary">
              <span>{t.notFound.cta}</span>
            </Link>
            <Link to="/boutique" className="btn btn--ghost">
              <span>{t.notFound.shop}</span>
              <ArrowRight className="btn__icon" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
