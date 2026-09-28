import { useRef, useState } from 'react'
import { useContent } from '../content'
import { useReveal } from '../hooks/useReveal'
import Field from '../components/Field'
import Footer from '../components/Footer'
import Heading from '../components/Heading'
import Kicker from '../components/Kicker'
import PageHead from '../components/PageHead'
import { ArrowRight } from '../components/Icons'
import Link from '../components/Link'
import { Hours, MapEmbed, StoreCard } from '../components/StoreCard'
import { LIMITS, clean, isEmail, mailto, screen, whatsapp } from '../lib/forms'
import { telHref } from '../lib/format'
import './Forms.css'

export default function Contact() {
  const t = useContent()
  const revealRef = useReveal()
  const copy = t.contact

  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    trap: '',
  })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const startedAt = useRef(Date.now()).current

  const set = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const lines = () => [
    [copy.fields.name, clean(values.name, LIMITS.name)],
    [copy.fields.email, clean(values.email, LIMITS.email)],
    [copy.fields.phone, clean(values.phone, LIMITS.phone)],
    [copy.fields.subject, clean(values.subject, LIMITS.subject)],
    [copy.fields.message, clean(values.message, LIMITS.message)],
  ]

  /*
   * Move focus to the first field that failed.
   *
   * Without it the error text renders somewhere above or below the fold and
   * the visitor is left at the submit button knowing only that something is
   * wrong. The order passed in is the visual order of the form, so focus
   * lands on the first problem going down the page.
   */
  const focusFirstError = (found, ids, order) => {
    const first = order.find((key) => found[key])
    if (first) document.getElementById(ids[first])?.focus()
  }

  const submit = (event, channel) => {
    event.preventDefault()
    if (screen({ trap: values.trap, startedAt })) return

    const found = {}
    if (clean(values.name, LIMITS.name).length < 2) found.name = copy.errors.name
    if (!isEmail(clean(values.email, LIMITS.email))) found.email = copy.errors.email
    if (clean(values.message, LIMITS.message).length < 4) found.message = copy.errors.message

    setErrors(found)
    if (Object.keys(found).length) {
      focusFirstError(found, { name: 'ct-name', email: 'ct-email', message: 'ct-message' }, ['name', 'email', 'message'])
      return
    }

    const subject = clean(values.subject, LIMITS.subject) || copy.formTitle
    window.location.href =
      channel === 'whatsapp'
        ? whatsapp(t.shop.whatsapp, [[subject, ''], ...lines()])
        : mailto(t.shop.email, subject, lines())

    setSent(true)
  }

  return (
    <div ref={revealRef}>
      <main id="top" className="page" data-surface="stone">
        <PageHead kicker={copy.kicker} title={copy.title} lede={copy.lede} />

        <section className="container page-layout">
          <form
            className="form-card reveal"
            data-surface="white"
            onSubmit={(event) => submit(event, 'mail')}
            noValidate
          >
            <h2 className="form-card__title">{copy.formTitle}</h2>

            <div className="field--trap" aria-hidden="true">
              <label htmlFor="ct-company">Company</label>
              <input
                id="ct-company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={values.trap}
                onChange={set('trap')}
              />
            </div>

            <div className="form-grid form-grid--two">
              <Field
                id="ct-name"
                label={copy.fields.name}
                error={errors.name}
                value={values.name}
                onChange={set('name')}
                autoComplete="name"
                maxLength={LIMITS.name}
                required
              />
              <Field
                id="ct-email"
                type="email"
                label={copy.fields.email}
                error={errors.email}
                value={values.email}
                onChange={set('email')}
                autoComplete="email"
                maxLength={LIMITS.email}
                required
              />
              <Field
                id="ct-phone"
                type="tel"
                label={copy.fields.phone}
                value={values.phone}
                onChange={set('phone')}
                autoComplete="tel"
                maxLength={LIMITS.phone}
              />
              <Field
                id="ct-subject"
                label={copy.fields.subject}
                value={values.subject}
                onChange={set('subject')}
                maxLength={LIMITS.subject}
              />
            </div>

            <Field
              as="textarea"
              id="ct-message"
              label={copy.fields.message}
              error={errors.message}
              value={values.message}
              onChange={set('message')}
              maxLength={LIMITS.message}
              required
            />

            <div aria-live="polite">
              {sent && <p className="form-status">{copy.success}</p>}
              {Object.keys(errors).length > 0 && (
                <p className="form-status form-status--error">{copy.errors.generic}</p>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn--primary">
                <span>{copy.submit}</span>
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={(event) => submit(event, 'whatsapp')}
              >
                <span>{copy.whatsapp}</span>
              </button>
            </div>

            <p className="form-note">{copy.note}</p>
          </form>

          <aside className="page-aside reveal" style={{ '--i': 1 }}>
            <StoreCard title={t.shop.name} />
            <Hours compact />
          </aside>
        </section>

        <section className="find-section" data-surface="white">
          <div className="container">
            <div className="section-grid find-section__head">
              <Kicker className="reveal">{copy.findKicker}</Kicker>
              <Heading className="h2" text={copy.findTitle} />
            </div>

            <div className="find-section__grid">
              <div className="find-section__map reveal">
                <MapEmbed label={copy.mapLabel} />
              </div>

              <div className="find-section__actions reveal" style={{ '--i': 1 }}>
                <Link to={telHref(t.shop.phones[0])} className="btn btn--primary">
                  <span>{copy.call}</span>
                </Link>
                <Link to={t.shop.mapsUrl} className="btn btn--ghost">
                  <span>{copy.directions}</span>
                  <ArrowRight className="btn__icon" />
                </Link>
                <Link to="/rendez-vous" className="btn btn--ghost">
                  <span>{t.nav.cta}</span>
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
