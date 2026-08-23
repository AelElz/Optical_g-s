import gsap from 'gsap'
import Lenis from 'lenis'

/*
 * One rAF loop for the whole site, split into a read phase and a write phase.
 *
 * Lenis is driven from GSAP's ticker rather than its own rAF, so the smoothed
 * scroll position and every scroll-reading effect resolve in the same frame.
 *
 * The split matters more than it looks. Several effects read geometry and
 * then write a custom property; run them back to back and every write
 * invalidates layout for the next reader, so the browser recalculates the
 * whole page several times a frame. Reads happen first, writes are queued
 * through write() and flushed afterwards, so layout is computed once.
 */

export const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

let lenis = null
let refCount = 0
let resizeObserver = null

const subscribers = new Set()
const writes = []
let lastY = -1
let dirty = true
let running = false
let covered = false

function frame(time) {
  /*
   * Nothing behind a full-screen layer is worth a frame. Most effects skip a
   * still frame on their own, but anything pointer-driven repaints whether or
   * not the page moved, and it would compete for exactly the frames the
   * covering layer's own animation needs.
   */
  if (covered) return

  const y = window.scrollY
  // Most effects depend only on scroll, so they can skip a still frame.
  const moved = dirty || y !== lastY
  lastY = y
  dirty = false

  writes.length = 0
  for (const fn of subscribers) fn(time, y, moved)
  for (const fn of writes) fn()
  writes.length = 0
}

const markDirty = () => {
  dirty = true
}

function startTicker() {
  if (running) return
  running = true
  gsap.ticker.add(frame)
  window.addEventListener('resize', markDirty)
}

function stopTicker() {
  if (!running) return
  running = false
  gsap.ticker.remove(frame)
  window.removeEventListener('resize', markDirty)
}

/*
 * Read phase. The callback gets (time, scrollY, moved); it may read geometry
 * freely but must push any DOM write through write().
 */
export function onFrame(callback) {
  subscribers.add(callback)
  startTicker()
  return () => {
    subscribers.delete(callback)
    if (!subscribers.size) stopTicker()
  }
}

/* Queue a DOM write to be flushed once every reader has finished. */
export function write(callback) {
  writes.push(callback)
}

export function initSmoothScroll() {
  refCount += 1

  if (!lenis && !reducedMotion()) {
    lenis = new Lenis({ autoRaf: false, lerp: 0.1 })
    // Lenis smooths the native scroll, it never replaces or hijacks it.
    // Added before the frame bus so reads see the settled position.
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    /*
     * Lenis caches the document height and clamps every scroll to it, so a
     * stale value is not a rounding problem: navigating from the short cart
     * page to the tall home page leaves the limit at the old height, which
     * caps jumps AND makes the lower part of the page unreachable. Height
     * changes on route change, on reveal, and when the webfont lands, so
     * watch the element rather than trying to enumerate the causes.
     */
    resizeObserver = new ResizeObserver(() => lenis?.resize())
    resizeObserver.observe(document.documentElement)

    // Lets a dev console step the scroll without racing the smoothing.
    if (import.meta.env.DEV) window.__lenis = lenis
  }

  return () => {
    refCount -= 1
    if (refCount > 0 || !lenis) return
    gsap.ticker.remove(tick)
    resizeObserver?.disconnect()
    resizeObserver = null
    lenis.destroy()
    lenis = null
  }
}

function tick(time) {
  // GSAP's ticker reports seconds; Lenis expects milliseconds.
  lenis?.raf(time * 1000)
}

/* Re-measure the scroller. Cheap, and the fix for every "it will not scroll
   past here" report after a route change. */
export function resizeScroll() {
  lenis?.resize()
}

/*
 * Put the page behind a full-screen layer to sleep: it stops scrolling, and
 * every scroll-driven effect stops painting.
 *
 * The scroll half goes through Lenis rather than the usual `overflow: hidden`
 * on body. `position: sticky` is ignored when any ancestor clips, and the
 * whole chapter stack is sticky, so locking the scroll that way would
 * silently collapse the depth effect for as long as the menu was open and
 * leave the page a different shape underneath when it closed.
 *
 * With reduced motion there is no Lenis to stop. The layer is opaque and
 * fixed, so a page scrolling behind it costs nothing but the position you
 * come back to, which is a fair trade against breaking the stack.
 */
export function freezeBackground(frozen) {
  covered = frozen
  // Whatever the effects missed while covered, recompute on the first frame
  // back rather than waiting for the next scroll to mark them dirty.
  if (!frozen) dirty = true

  if (!lenis) return
  if (frozen) lenis.stop()
  else lenis.start()
}

/*
 * Where an element sits in the document, ignoring sticky.
 *
 * Every panel is sticky, and a pinned panel lies about its position twice
 * over: its rect reports top: 0 for as long as it is pinned, and its
 * offsetTop is shifted by the pin as well. Resolving a scroll target from
 * either one means "scroll to where you already are", which is why an
 * in-page nav link can silently do nothing.
 *
 * A sticky element still reserves its normal space in the flow, so its true
 * position is the container's top plus the heights of the siblings before
 * it. Heights are not affected by pinning.
 */
function documentTop(element) {
  if (getComputedStyle(element).position === 'sticky') {
    const parent = element.parentElement
    let y = documentTop(parent) + (parseFloat(getComputedStyle(parent).paddingTop) || 0)
    for (const sibling of parent.children) {
      if (sibling === element) break
      y += sibling.offsetHeight
    }
    return y
  }

  let y = 0
  let node = element
  while (node) {
    y += node.offsetTop
    node = node.offsetParent
  }
  return y
}

export { documentTop }

/*
 * Jumps by default. In-page nav should land immediately: smooth-scrolling the
 * full height of a chaptered stack takes seconds and reads as a hang.
 *
 * Pass history: true for user-initiated navigation, so each chapter becomes a
 * real history entry and Back walks through them.
 */
export function scrollTo(target, { immediate = true, history: push = false } = {}) {
  const hash = typeof target === 'string' ? target : `#${target.id}`
  const element = typeof target === 'string' ? document.querySelector(target) : target
  if (!element) return

  if (push && window.location.hash !== hash) {
    window.history.pushState(null, '', hash)
  }

  const y = documentTop(element)

  if (lenis) {
    /*
     * ResizeObserver delivers after rAF, so on the first frame of a new page
     * the cached limit can still be the previous page's. Re-measuring costs
     * one read and guarantees the jump is not clamped short.
     */
    lenis.resize()
    /*
     * force, so a jump the app asked for still lands while the scroll is
     * frozen behind a full-screen layer. Without it, closing the menu and
     * scrolling in the same click is silently a no-op: the state change that
     * lifts the freeze has not committed yet, and a stopped Lenis drops it.
     */
    lenis.scrollTo(y, { immediate, force: true })
    return
  }
  window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' })
}

/*
 * Back to the top.
 *
 * Never a bare window.scrollTo(0, 0) while Lenis is running: that moves the
 * document without telling Lenis, so its internal position is still wherever
 * it was and the next frame smoothly scrolls you back down again. Everything
 * that resets the scroll goes through here.
 */
export function scrollToTop({ immediate = true } = {}) {
  if (lenis) {
    lenis.resize()
    lenis.scrollTo(0, { immediate, force: true })
    return
  }
  window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' })
}

/* Give up after this many frames rather than fight the layout forever. */
const LANDING_FRAMES = 20

/*
 * Keeps Back and Forward working, and honours a hash typed into the address
 * bar or carried in from another page.
 *
 * The landing scroll retries instead of firing once. Arriving with a hash is
 * the worst moment to measure anything: the chapters may not be in the DOM
 * yet, their sticky offsets are set by a separate effect, the webfont can
 * still reflow them, and Lenis's cached limit may still be the previous
 * page's, which silently clamps the jump short. Re-checking each frame until
 * the position holds is far more robust than picking one correct moment.
 */
export function initHistoryNav() {
  const go = () => scrollTo(window.location.hash || '#top')
  let frames = 0

  const land = () => {
    const hash = window.location.hash
    if (!hash) return

    const element = document.querySelector(hash)
    if (element) {
      scrollTo(hash)
      // Settled once we are where the element says it is.
      if (Math.abs(window.scrollY - documentTop(element)) < 2) return
    }

    if (frames < LANDING_FRAMES) {
      frames += 1
      requestAnimationFrame(land)
    }
  }

  if (window.location.hash) requestAnimationFrame(land)
  window.addEventListener('popstate', go)
  return () => window.removeEventListener('popstate', go)
}

export const clamp = (value, min = 0, max = 1) =>
  value < min ? min : value > max ? max : value

export const lerp = (a, b, t) => a + (b - a) * t

/*
 * Frame-rate independent exponential smoothing.
 *
 * A plain `current += (target - current) * 0.1` moves at a different speed on
 * a 120Hz display than on a 60Hz one, so the same page feels twice as fast on
 * a ProMotion screen. Scaling by the real elapsed time fixes that.
 */
export function damp(current, target, smoothing, deltaTime) {
  return lerp(target, current, Math.exp(-smoothing * deltaTime))
}

export const mapRange = (value, inMin, inMax, outMin, outMax) =>
  outMin + ((clamp(value, inMin, inMax) - inMin) / (inMax - inMin || 1)) * (outMax - outMin)

/*
 * A cached rect, for pointer handlers.
 *
 * Calling getBoundingClientRect() inside a pointermove handler forces a
 * synchronous layout on every event, and when the same handler then writes a
 * style, the two thrash each other: read, write, read, write, once per event,
 * all inside the window the browser measures for INP.
 *
 * A rect only moves when the page scrolls or the window resizes, so cache it
 * and invalidate on exactly those two.
 */
export function trackRect(element) {
  let rect = null
  const invalidate = () => {
    rect = null
  }

  window.addEventListener('scroll', invalidate, { passive: true })
  window.addEventListener('resize', invalidate)

  const read = () => {
    if (!rect) rect = element.getBoundingClientRect()
    return rect
  }

  read.stop = () => {
    window.removeEventListener('scroll', invalidate)
    window.removeEventListener('resize', invalidate)
  }

  return read
}
