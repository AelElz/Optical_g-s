import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { reducedMotion } from '../lib/motion'
import { Mark } from './Icons'
import './Preloader.css'

/*
 * The intro.
 *
 * The ink stage, the gold mark drawing its right lens and the name pulling
 * into focus, then a wipe up to reveal the page. It runs once per session, not once per navigation: seeing it again
 * on the way back from the cart would be an irritation, not a flourish.
 */

const SESSION_KEY = 'opticalgs:seen-intro'

/* Wall clock, deliberately longer than the timeline. See below. */
const ESCAPE_MS = 6000

function alreadySeen() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    /* Private mode throws rather than returning null. Showing the intro one
       extra time is a far better failure than throwing on boot. */
    return false
  }
}

function markSeen() {
  try {
    window.sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    /* See above. */
  }
}

export default function Preloader() {
  /* Lazy initialiser, and it decides on the very first render: mounting the
     cover and then removing it a frame later is a visible flash. */
  const [skip] = useState(() => alreadySeen() || reducedMotion())
  const [done, setDone] = useState(skip)
  const rootRef = useRef(null)

  useEffect(() => {
    if (skip) {
      document.documentElement.classList.remove('is-loading')
      return
    }

    const finish = () => {
      markSeen()
      setDone(true)
      document.documentElement.classList.remove('is-loading')
    }

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ onComplete: finish })

      /*
       * The explicit 0 is load-bearing.
       *
       * Without a position, .set() lands at the timeline's current END, so
       * the initial states get applied after the animations they were meant
       * to precede and the mark snaps back to its start pose at the finish.
       */
      timeline.set('.preloader__mark', { opacity: 0, scale: 0.92 }, 0)
      timeline.set('.preloader__word', { opacity: 0, filter: 'blur(10px)' }, 0)

      timeline
        .to('.preloader__mark', { opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' }, 0.1)
        .to(
          '.preloader__mark circle',
          { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' },
          0.2,
        )
        .to('.preloader__word', { opacity: 1, filter: 'blur(0px)', duration: 0.7, ease: 'power2.out' }, 0.55)
        .to(
          rootRef.current,
          { clipPath: 'inset(0 0 100% 0)', duration: 0.85, ease: 'power3.inOut' },
          1.35,
        )
    }, rootRef)

    /*
     * GSAP runs on requestAnimationFrame, which is suspended entirely while
     * the tab is in the background. Someone who opens the site in a
     * background tab and comes back to it several minutes later would
     * otherwise find a page permanently covered by the intro, with no
     * error anywhere to explain it.
     *
     * setTimeout keeps running when rAF does not, so it is the escape hatch.
     */
    const escape = window.setTimeout(finish, ESCAPE_MS)

    return () => {
      window.clearTimeout(escape)
      context.revert()
    }
  }, [skip])

  if (done) return null

  return (
    <div className="preloader" ref={rootRef} aria-hidden="true">
      <div className="preloader__center">
        <Mark height={54} className="preloader__mark" />
        <span className="preloader__word">Optical G&amp;S</span>
      </div>
    </div>
  )
}
