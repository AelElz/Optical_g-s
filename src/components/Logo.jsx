import { Mark } from './Icons'
import './Logo.css'

/* The lockup: the gold spectacles mark, then the wordmark in heavy caps. */
export default function Logo({ height = 20 }) {
  return (
    <span className="logo">
      <Mark height={height} className="logo__mark" />
      <span className="logo__word">Optical G&amp;S</span>
    </span>
  )
}
