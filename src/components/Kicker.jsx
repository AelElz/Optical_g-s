import { Mark } from './Icons'
import './Kicker.css'

/*
 * The section label, with the spectacles mark in front of it.
 *
 * Every kicker on the site goes through this, so the mark is never forgotten
 * on one section and never drawn at a different size on another. It replaces
 * the plain rule that used to sit there: a hairline says nothing, and the
 * brand's own mark repeated down the page is what ties the chapters together.
 *
 * The mark is decorative here. It carries no meaning the label does not
 * already carry, and a screen reader announcing "Optical G and S logo" before
 * every heading in the page would be noise, so it stays aria-hidden.
 */
export default function Kicker({ children, className = '', ...rest }) {
  return (
    <p className={`kicker ${className}`.trim()} {...rest}>
      <Mark height={11} className="kicker__mark" />
      <span className="kicker__text">{children}</span>
    </p>
  )
}
