import { useEffect, useRef } from 'react'
import { clamp, damp, onFrame, reducedMotion, write } from '../lib/motion'

/*
 * Continuous scroll-linked motion, the primitive the cinematic sections are
 * built from.
 *
 * Publishes two custom properties on the element:
 *
 *   --p   raw progress, 0 as the element's top reaches the bottom of the
 *         viewport, 1 as its bottom leaves the top of it
 *   --pd  the same value damped, so anything driven by it settles instead of
 *         snapping one-to-one with the wheel
 *
 * Everything visual then lives in CSS, which keeps the per-frame work here to
 * one rect read and two property writes.
 *
 * `smoothing` is the exponential rate, not a per-frame factor, so the result
 * is identical on a 60Hz and a 120Hz display.
 */
export function useScrollProgress({ smoothing = 6, dampen = true } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    /*
     * With reduced motion the element still needs sane values, or anything
     * that reads --p renders at its 0 state and looks broken. Pin it to the
     * midpoint once and never subscribe to the ticker at all.
     */
    if (reducedMotion()) {
      el.style.setProperty('--p', '0.5')
      el.style.setProperty('--pd', '0.5')
      return
    }

    let smoothed = null
    let last = null

    const render = (time, scrollY, moved) => {
      /*
       * Deliberately not gated on `moved`. The damped value is still
       * travelling towards its target on the frames after the scroll stops,
       * and skipping those leaves it frozen part-way.
       */
      const rect = el.getBoundingClientRect()
      const viewport = window.innerHeight
      const span = rect.height + viewport || 1
      const raw = clamp((viewport - rect.top) / span)

      const delta = last === null ? 1 / 60 : Math.min(time - last, 0.1)
      last = time

      if (smoothed === null || !dampen) smoothed = raw
      else smoothed = damp(smoothed, raw, smoothing, delta)

      // Nothing has changed and the damping has settled: skip the write.
      if (!moved && Math.abs(smoothed - raw) < 0.0005) return

      write(() => {
        el.style.setProperty('--p', raw.toFixed(4))
        el.style.setProperty('--pd', smoothed.toFixed(4))
      })
    }

    return onFrame(render)
  }, [smoothing, dampen])

  return ref
}
