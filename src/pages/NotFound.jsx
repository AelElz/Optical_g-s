import { useRef } from 'react'
import { useContent } from '../content'
import { usePanelStack } from '../hooks/usePanelStack'
import { useReveal } from '../hooks/useReveal'
import Footer from '../components/Footer'
import Kicker from '../components/Kicker'
import { ArrowRight } from '../components/Icons'
import Link from '../components/Link'
import Panel from '../components/Panel'
import './NotFound.css'

export default function NotFound() {
  const t = useContent()
  const stackRef = useRef(null)
  usePanelStack(stackRef)
  const revealRef = useReveal()

  return (
    <div ref={revealRef}>
      <main id="top" ref={stackRef}>
        <Panel tone="light" dwell="0svh">
          <div className="container container--narrow notfound">
            <Kicker className="reveal">{t.notFound.kicker}</Kicker>
            <h1 className="display notfound__title">
              <span className="wipe">
                <span>{t.notFound.title}</span>
              </span>
            </h1>
            <p className="section-lede reveal" style={{ '--i': 1 }}>
              {t.notFound.lede}
            </p>
            <div className="notfound__actions reveal" style={{ '--i': 2 }}>
              <Link to="/" className="btn btn--primary">
                <span>{t.notFound.cta}</span>
              </Link>
              <Link to="/boutique" className="btn btn--ghost">
                <span>{t.notFound.shop}</span>
                <ArrowRight className="btn__icon" />
              </Link>
            </div>
          </div>
        </Panel>
      </main>

      <Footer />
    </div>
  )
}
