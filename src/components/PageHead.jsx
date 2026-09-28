import Heading from './Heading'
import Kicker from './Kicker'
import './PageHead.css'

/*
 * The opening of every inner page: a short ink stage with the label in the
 * margin column and the title set large, so each page starts on the same
 * dark ground the home page opens on and the header reads the same way.
 */
export default function PageHead({ kicker, title, accent, lede, children, surface = 'ink' }) {
  return (
    <section className="page-head" data-surface={surface}>
      <div className="container section-grid">
        {kicker ? <Kicker className="reveal">{kicker}</Kicker> : <span aria-hidden="true" />}
        <div className="page-head__body">
          <Heading as="h1" className="h1 page-head__title" text={title} accent={accent} />
          {lede && (
            <p className="lead reveal" style={{ '--i': 1 }}>
              {lede}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  )
}
