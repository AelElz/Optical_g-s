import { Fragment, useState } from 'react'
import { Pause, Play } from './Icons'
import './Ticker.css'

/*
 * The Devorise ticker: huge uppercase words sliding past, a gold lens ring
 * between each. Here the words are the houses the shop actually stocks.
 *
 * Pure CSS: the list is rendered twice and the track slides by exactly one
 * copy, so the loop has no seam. Moving content that runs for more than five
 * seconds needs a way to stop it, so there is a pause control; reduced motion
 * stops it outright. The words are decorative (the same houses are in the
 * shop's own listing), so the track is hidden from screen readers.
 */
export default function Ticker({ items, pauseLabel, playLabel }) {
  const [paused, setPaused] = useState(false)

  const row = (copy) => (
    <span className="ticker__row" aria-hidden="true" key={copy}>
      {items.map((item) => (
        <Fragment key={item}>
          <span className="ticker__word">{item}</span>
          <span className="lens-dot ticker__dot" />
        </Fragment>
      ))}
    </span>
  )

  return (
    <div className="ticker" data-paused={paused}>
      <div className="ticker__track">{[row('a'), row('b')]}</div>
      <button
        type="button"
        className="ticker__toggle"
        onClick={() => setPaused((value) => !value)}
        aria-label={paused ? playLabel : pauseLabel}
        aria-pressed={paused}
      >
        {paused ? <Play /> : <Pause />}
      </button>
    </div>
  )
}
