import { useEffect, useRef, useState } from 'react'
import { reducedMotion } from '../lib/motion'
import { Pause, Play } from './Icons'
import Notation from './Notation'
import './HeroLens.css'

const INTERVAL = 3600

/*
 * The hero's lens: a white plate ringed in the logo's gold lens, holding one
 * real frame from the catalogue at a time. Every few seconds it pulls focus,
 * the frame blurring out as the next one sharpens in, which is what an
 * optician's trial lens does and what the rest of the site's motion echoes.
 *
 * It runs only while on screen and while the tab is visible, stops under
 * reduced motion, and has a pause control because it would otherwise move
 * for longer than five seconds.
 */
export default function HeroLens({ frames, label, pauseLabel, playLabel, measurementsLabel }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(() => reducedMotion())
  const [visible, setVisible] = useState(true)
  const rootRef = useRef(null)

  useEffect(() => {
    const el = rootRef.current
    if (!el || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (paused || !visible) return
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') setIndex((i) => (i + 1) % frames.length)
    }, INTERVAL)
    return () => window.clearInterval(timer)
  }, [paused, visible, frames.length])

  const current = frames[index]

  return (
    <figure className="lens" ref={rootRef}>
      <div className="lens__stage">
        <span className="lens__ring lens__ring--outer" aria-hidden="true" />
        <span className="lens__ring lens__ring--inner" aria-hidden="true" />
        <div className="lens__plate">
          {frames.map((frame, i) => (
            <img
              key={frame.id}
              className="lens__frame"
              data-active={i === index}
              src={frame.image}
              alt={i === index ? `${frame.brand} ${frame.ref}` : ''}
              aria-hidden={i === index ? undefined : 'true'}
              width="900"
              height="675"
              fetchPriority={i === 0 ? 'high' : 'low'}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          ))}
        </div>
      </div>

      <figcaption className="lens__caption">
        <span className="lens__label">{label}</span>
        <span className="lens__name" aria-live="polite">
          <span className="lens__brand">{current.brand}</span> {current.ref}
        </span>
        <Notation product={current} label={measurementsLabel} className="lens__notation" />
        <button
          type="button"
          className="lens__toggle"
          onClick={() => setPaused((value) => !value)}
          aria-label={paused ? playLabel : pauseLabel}
          aria-pressed={paused}
        >
          {paused ? <Play size={12} /> : <Pause size={12} />}
        </button>
      </figcaption>
    </figure>
  )
}
