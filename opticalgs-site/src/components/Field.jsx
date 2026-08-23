/*
 * One labelled control, shared by the booking, contact and checkout forms.
 *
 * aria-invalid and aria-describedby are what turn a red border into an error
 * a screen reader can report. A colour change on its own communicates
 * nothing at all to anyone who is not looking at it, and "required" with no
 * accessible error text is how a form becomes impossible to complete rather
 * than merely annoying.
 */
export default function Field({
  id,
  label,
  error,
  type = 'text',
  as = 'input',
  name,
  children,
  ...rest
}) {
  const described = error ? `${id}-error` : undefined
  const shared = {
    id,
    /*
     * A real `name`, defaulted from the id.
     *
     * Nothing posts these forms, but the name is what a browser's autofill
     * and a password manager read to decide what a field holds, and an
     * unnamed input is offered nothing. The id is already unique per page.
     */
    name: name ?? id,
    className: 'field__control',
    'aria-invalid': Boolean(error),
    'aria-describedby': described,
    /*
     * Spellcheck off on the short structured fields. A red squiggle under
     * someone's surname or under an email address is noise, and on a phone
     * it invites an autocorrect that silently corrupts the value.
     */
    spellCheck: type === 'email' || type === 'tel' ? false : undefined,
    ...rest,
  }

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>

      {as === 'textarea' && <textarea {...shared} />}
      {as === 'select' && <select {...shared}>{children}</select>}
      {as === 'input' && <input type={type} {...shared} />}

      {error && (
        <p className="field__error" id={described}>
          {error}
        </p>
      )}
    </div>
  )
}
