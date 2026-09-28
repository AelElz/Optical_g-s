/*
 * A frame's size, written the way an optician reads it off the inside of the
 * temple: lens width, a small square, bridge width, then temple length.
 * 54□16 142. It is the one piece of typography only an optician's shop has,
 * so the catalogue sets it on every frame.
 *
 * The square is drawn in CSS rather than typed: U+25A1 is not in the site's
 * typeface and would fall back to whatever the system has. The readable
 * version goes to screen readers with the three names spelled out.
 */
export default function Notation({ product, label, className = '' }) {
  const { lens, bridge, temple } = product
  if (!lens || !bridge) return null

  return (
    <span className={`notation tnum ${className}`.trim()}>
      <span className="visually-hidden">
        {label}: {[lens, bridge, temple].filter(Boolean).join(', ')}
      </span>
      <span aria-hidden="true">
        {lens}
        <span className="notation__box" />
        {bridge}
        {temple && <span className="notation__temple">{temple}</span>}
      </span>
    </span>
  )
}
