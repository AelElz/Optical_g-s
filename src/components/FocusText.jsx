import { useEffect, useMemo, useRef } from 'react'
import { clamp, onFrame, reducedMotion, write } from '../lib/motion'
import './FocusText.css'

/*
 * A statement that comes into focus word by word as it scrolls up the page.
 *
 * Devorise reads its statements grey to white; an optician's version is the
 * lens being brought into focus, so each word goes from blurred and faint to
 * sharp. It is the site's one authored motion moment.
 *
 * The words are split for the eye only. Screen readers get the sentence once,
 * from a visually hidden copy, and the split words are aria-hidden, so the
 * text is never read one word at a time. Progress is written as one custom
 * property on the paragraph; every word's blur is resolved in CSS from its own
 * index, so the per-frame work is one rect read and one write.
 */
export default function FocusText({ text, as: Tag = 'p', className = '' }) {
  const ref = useRef(null)
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (reducedMotion()) {
      el.style.setProperty('--focus', '1')
      return
    }

    let last = -1
    return onFrame((time, scrollY, moved) => {
      // A pure function of scroll: a still page needs no rect read.
      if (!moved && last >= 0) return
      const rect = el.getBoundingClientRect()
      const viewport = window.innerHeight
      // In focus from the moment the first line clears 85% of the viewport
      // until the last line reaches 45%.
      const start = viewport * 0.85
      const end = viewport * 0.45
      const progress = clamp((start - rect.top) / (rect.height + start - end))
      if (Math.abs(progress - last) < 0.001) return
      last = progress
      write(() => el.style.setProperty('--focus', progress.toFixed(4)))
    })
  }, [text])

  return (
    <Tag
      ref={ref}
      className={`focus-text ${className}`.trim()}
      style={{ '--count': words.length }}
    >
      <span className="visually-hidden">{text}</span>
      <span className="focus-text__words" aria-hidden="true">
        {words.map((word, index) => (
          <span className="focus-text__word" key={`${index}-${word}`} style={{ '--w': index }}>
            {word}{' '}
          </span>
        ))}
      </span>
    </Tag>
  )
}
