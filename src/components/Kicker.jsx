import { Mark } from './Icons'
import './Kicker.css'

/*
 * The section label, with the spectacles mark in front of it.
 *
 * Every section label on the site goes through this, so the mark is never
 * forgotten on one section (a client rule). The mark is decorative here: a
 * screen reader announcing the logo before every heading would be noise.
 */
export default function Kicker({ children, className = '', ...rest }) {
  return (
    <p className={`kicker ${className}`.trim()} {...rest}>
      <Mark height={10} className="kicker__mark" />
      <span className="kicker__text">{children}</span>
    </p>
  )
}
