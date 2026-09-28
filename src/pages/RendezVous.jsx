import { useMemo, useRef, useState } from 'react'
import { useContent } from '../content'
import { useReveal } from '../hooks/useReveal'
import Field from '../components/Field'
import Footer from '../components/Footer'
import PageHead from '../components/PageHead'
import { ArrowRight } from '../components/Icons'
import Link from '../components/Link'
import { Hours, StoreCard } from '../components/StoreCard'
import { LIMITS, clean, isEmail, isPhone, mailto, screen, whatsapp } from '../lib/forms'
import './Forms.css'

/* The shop opens at 10 and closes at 20, so the last hour-long slot starts
   at 19. Half-hour steps, which is the granularity the services use. */
const SLOTS = (() => {
  const out = []
  for (let hour = 10; hour <= 19; hour += 1) {
    out.push(`${String(hour).padStart(2, '0')}:00`)
    if (hour < 19) out.push(`${String(hour).padStart(2, '0')}:30`)
  }
  return out
})()

const today = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export default function RendezVous() {
  const t = useContent()
  const revealRef = useReveal()
  const copy = t.rendezVous

  /*
   * The chosen service is stored as an INDEX, not as its label.
   *
   * The label is copy. Storing it means a language switch leaves this state
   * holding a string that is no longer in the list, so the selection appears
   * to clear itself and a required field silently becomes unsubmittable. An
   * index survives the switch and re-reads the new language's label.
   */
  const [service, setService] = useState(0)
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    notes: '',
    trap: '',
  })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)

  /* Fixed at mount: the minimum fill time is measured from when the form
     appeared, not from when the visitor started typing. */
  const startedAt = useRef(Date.now()).current
  const min = useMemo(today, [])

  const set = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const validate = () => {
    const found = {}
    if (clean(values.name, LIMITS.name).length < 2) found.name = copy.errors.name
    if (!isEmail(clean(values.email, LIMITS.email))) found.email = copy.errors.email
    if (!isPhone(clean(values.phone, LIMITS.phone))) found.phone = copy.errors.phone
    if (!values.date) found.date = copy.errors.date
    else if (values.date < min) found.date = copy.errors.past
    // The shop is closed on Sunday, so a Sunday booking cannot be honoured.
    else if (new Date(`${values.date}T12:00:00`).getDay() === 0) found.date = copy.errors.closed
    if (!values.time) found.time = copy.errors.time
    return found
  }

  const lines = () => [
    [copy.fields.name, clean(values.name, LIMITS.name)],
    [copy.fields.email, clean(values.email, LIMITS.email)],
    [copy.fields.phone, clean(values.phone, LIMITS.phone)],
    [copy.fields.service, copy.services[service].name],
    [copy.fields.date, values.date],
    [copy.fields.time, values.time],
    [copy.fields.notes, clean(values.notes, LIMITS.notes)],
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

    /* Silent on a failed screen. Telling a bot which check it tripped is
       telling it how to pass; a person never sees this branch. */
    if (screen({ trap: values.trap, startedAt })) return

    const found = validate()
    setErrors(found)
    if (Object.keys(found).length) {
      focusFirstError(found, { name: 'rv-name', email: 'rv-email', phone: 'rv-phone', date: 'rv-date', time: 'rv-time' }, ['name', 'email', 'phone', 'date', 'time'])
      return
    }

    const subject = `${copy.formTitle}, ${copy.services[service].name}`
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
          <form className="form-card reveal" data-surface="white" onSubmit={(event) => submit(event, 'mail')} noValidate>
            <h2 className="form-card__title">{copy.formTitle}</h2>

            {/* Off-screen rather than display:none: some bots skip anything
                that is not rendered at all. */}
            <div className="field--trap" aria-hidden="true">
              <label htmlFor="rv-company">Company</label>
              <input
                id="rv-company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={values.trap}
                onChange={set('trap')}
              />
            </div>

            <div className="form-grid">
              <Field
                id="rv-name"
                label={copy.fields.name}
                error={errors.name}
                value={values.name}
                onChange={set('name')}
                autoComplete="name"
                maxLength={LIMITS.name}
                required
              />
              <Field
                id="rv-email"
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
                id="rv-phone"
                type="tel"
                label={copy.fields.phone}
                error={errors.phone}
                value={values.phone}
                onChange={set('phone')}
                autoComplete="tel"
                maxLength={LIMITS.phone}
                required
              />
            </div>

            <fieldset className="services-pick">
              <legend className="field__label">{copy.fields.service}</legend>
              {/* radiogroup, not a row of buttons. These are mutually
                  exclusive, and the role is what makes a screen reader
                  announce "2 of 4, selected" instead of four unrelated
                  buttons. */}
              <div className="services-pick__grid" role="radiogroup">
                {copy.services.map((option, index) => (
                  /* Keyed on `n`. See the note on storing the index. */
                  <button
                    key={option.n}
                    type="button"
                    role="radio"
                    aria-checked={service === index}
                    className="services-pick__option"
                    data-active={service === index}
                    onClick={() => setService(index)}
                  >
                    <span className="services-pick__name">{option.name}</span>
                    <span className="services-pick__duration">{option.duration}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="form-grid form-grid--two">
              <Field
                id="rv-date"
                type="date"
                label={copy.fields.date}
                error={errors.date}
                value={values.date}
                onChange={set('date')}
                min={min}
                required
              />

              <div className="field">
                <label className="field__label" htmlFor="rv-time">
                  {copy.fields.time}
                </label>
                <select
                  id="rv-time"
                  className="field__control"
                  value={values.time}
                  onChange={set('time')}
                  aria-invalid={Boolean(errors.time)}
                  aria-describedby={errors.time ? 'rv-time-error' : undefined}
                  required
                >
                  <option value="">{copy.fields.timePlaceholder}</option>
                  {SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                {errors.time && (
                  <p className="field__error" id="rv-time-error">
                    {errors.time}
                  </p>
                )}
              </div>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="rv-notes">
                {copy.fields.notes}
              </label>
              <textarea
                id="rv-notes"
                className="field__control"
                value={values.notes}
                onChange={set('notes')}
                maxLength={LIMITS.notes}
                placeholder={copy.fields.notesPlaceholder}
              />
            </div>

            {/* aria-live, so a screen reader hears the outcome. Without it a
                sighted user sees a confirmation and everyone else gets
                silence. */}
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
            <StoreCard title={copy.storeTitle} />
            <Hours compact />
            <Link to="/contact" className="link-arrow">
              <span>{t.nav.links[4].label}</span>
              <ArrowRight size={13} />
            </Link>
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  )
}
