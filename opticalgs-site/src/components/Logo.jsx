import { Mark } from './Icons'
import './Logo.css'

/*
 * The lockup: the spectacles mark, then the wordmark.
 *
 * The mark is the brand's own Logo.svg. The wordmark beside it is set in
 * Readex Pro at regular weight with wide tracking, which is how every luxury
 * house sets a wordmark: Bugatti at 6px of tracking, Ferrari at 1.4. Weight
 * is never the emphasis.
 */
export default function Logo({ height = 20 }) {
  return (
    <span className="logo">
      <Mark height={height} className="logo__mark" />
      <span className="logo__word">Optical G&amp;S</span>
    </span>
  )
}
