# AGENTS.md

Working notes for anyone, human or otherwise, editing this repository. Read
[README.md](README.md) first for the stack and the design system; this file is
the reasoning, the traps and how to verify work here.

Everything below was learned by breaking it. Each invariant is written with the
symptom it produces, because most of them **fail silently and look completely
fine in a screenshot**.

---

## 1. The rule that matters most

**Verify by measuring, not by looking.**

Every real bug found while building this rendered a plausible page. The
collapsed images, the double history entry, the cut-off chapter and the grain
that ignored Reduce Motion were all found by reading geometry and computed
styles, never by eye.

Two environment facts that will mislead you:

- **A backgrounded tab runs no rendering steps.** rAF stops, CSS transitions
  freeze mid-value, and IntersectionObserver never fires. A blank screenshot or
  an element stuck at `opacity: 0` is usually this, not a bug. To tell a frozen
  transition from a rule that does not apply, set `el.style.transition = 'none'`,
  force a reflow, then read the computed value.
- **Lenis fights `window.scrollTo`.** Calling it directly desynchronises Lenis's
  internal position and the next assertion is meaningless. Use
  `window.__lenis.scrollTo(y, { immediate: true, force: true })` (exposed in dev
  only), or drive through real input events.

---

## 2. Invariants you must not break

### Sticky elements lie about their position, twice

A pinned panel reports `top: 0` from `getBoundingClientRect()` **and** a shifted
`offsetTop`. Resolving a scroll target from either means "scroll to where you
already are".

Use `documentTop()` in `src/lib/motion.js`, which rebuilds the true position
from the flow: container top plus the heights of preceding siblings. Heights are
unaffected by pinning.

*Symptom: an in-page nav link does nothing.*

### `html` and `body` must stay free of `overflow`

`position: sticky` is silently ignored if **any** ancestor has
`overflow: hidden/clip/auto/scroll`. The whole chapter stack is sticky.

*Symptom: the depth effect degrades to ordinary scrolling, with no error.*

### A pinned chapter taller than the viewport loses its head

`usePanelStack` pins a tall panel at its BOTTOM (`top: viewport - height`) so
its lower content is reachable. The cost is that once it locks, everything above
the viewport height is permanently off-screen.

The services chapter came to 1481px against a 900px viewport, so its title and
lede were never visible while the chapter was on screen. The fix was a
two-column layout, not a smaller font.

**Keep every `.panel__inner` at or under 100svh.** Measure it; do not estimate.

*Symptom: a chapter you can read while it scrolls in, and cannot once it stops.*

### The last panel gets no dwell

`.panel:last-child { min-height: 100svh }`. The final panel is `main`'s last
child, so its sticky range is zero and it cannot pin. Its dwell space would ride
up the bottom of the screen.

*Symptom: a growing blank band at the bottom before the footer.*

### `.panel__grain` must be sized in percentages

`inset: -14%`, scaling with the panel. A fixed height leaves a taller panel
short, producing a hard horizontal edge where texture becomes flat colour, which
slides as the panel settles into its pin. The margin must stay comfortably
larger than the 5% drift in the keyframes.

### A media query adds no specificity

`@media (prefers-reduced-motion: reduce) { .panel__grain { animation: none } }`
loses to `.panel--ink .panel__grain` outside it. **Reduced-motion overrides must
repeat the full selector that turned the effect on.**

*Symptom: the grain re-seeds seven times a second for exactly the people who
asked it not to.*

### Never animate `transform` on the nav indicator

`.navbar__indicator` is centred with `transform: translateY(-50%)`. Animating
`transform` replaces that outright, dropping it half its height. Animate `left`
and `width` only; use the `scale` and `translate` longhands if you need an
independent transform anywhere.

### `place()` must re-run when the labels change, not just the route

The indicator is measured from the active link, and the labels are copy:
"Shop" and "Boutique" are different widths. `useLayoutEffect` therefore depends
on `links` as well as on `path`.

*Symptom: the rule under-hangs the word, in one language only.*

### Percentage padding on a flex item resolves against the CONTAINER

`.marquee__item { padding: 4% }` inside a `width: max-content` flex track came
out at 124px a side on a 220px tile. The content box collapsed to zero and every
frame in the strip rendered as an empty white card. Nothing errored and the
images had all loaded; they were laid out at 0x0.

**Use fixed padding inside a `max-content` flex track.**

*Symptom: images that load fine and render at 0x0.*

### Never put a side effect in a `setState` updater

React invokes an updater twice in development StrictMode to surface impure ones.
A `history.pushState` in there pushed two identical entries, so Back appeared to
do nothing: the first press only removed the duplicate.

The shop's `update()` computes the next state from a ref, writes history, then
calls `setState` with the finished value.

*Symptom: Back needs two presses, in dev only.*

### GSAP `.set()` needs an explicit position

`.set(el, {...}, 0)`. Without the `0` it lands at the timeline's current end, so
initial states are applied after the animations they were meant to precede.

*Symptom: the intro snaps back to its start pose at the finish.*

### rAF-based intros need a wall-clock escape hatch

GSAP runs on rAF, which is suspended in background tabs. The preloader carries
`setTimeout(finish, 6000)`. Without it, a visitor who opens the site in a
background tab returns to a permanently covered page.

### `useReveal` checks rects synchronously before observing

IntersectionObserver delivers its first callback only after a rendering step.
Deep links, restored scroll positions and background tabs would leave content at
`opacity: 0` indefinitely. The hook does a synchronous rect check first, then
observes, and adopts late-mounted nodes through a MutationObserver.

### Lenis caches the document height

It clamps scrolling to a stale limit after a route change, which does not just
break jumps: it makes the lower part of a taller page unreachable. Re-measure on
route change and before programmatic jumps (`resizeScroll()`).

### Same-page navigation is not a no-op

Clicking the logo, or the nav item for the page you are already on, changes no
path, so the router treats it as nothing. `Link` intercepts that case and scrolls
to the top, which is what both controls are understood to mean.

*Symptom: clicking the logo halfway down the page does nothing at all.*

### A React key taken from translated copy makes content disappear

`key={item.name}` looks stable. It is not: the name is copy, so switching
language changes the key, React unmounts the element, and the replacement
arrives without `is-in`, which is `opacity: 0`.

**Key list items on something that is not copy.** Every list here carries an `n`
or a locale-independent `key` and uses it.

### State keyed on copy has to survive a language switch

A `<select>` value is the option's own text, so a language change leaves it
holding a string no longer in the list: the box goes blank and a required field
silently becomes unsubmittable. The booking service and the delivery city are
both stored as an **index**.

---

## 3. Patterns to follow

**One typeface, three weights.** Readex Pro at 300, 400 and 500. Nothing is
bold. If something needs emphasis, make it larger, uppercase it, or open the
tracking. Adding a second family or a 700 weight undoes the system.

**Sharp corners.** `--r` is `0`. The cart badge is the only exception and it is
documented at the point of use.

**Hairlines, never shadows.** There is no shadow scale and adding one is a
change to the design system, not a tweak.

**Every section label is a `<Kicker>`,** which carries the mark. Do not write a
bare `<p className="kicker">`.

**No dash as a connector in user-facing copy.** Not the em dash, not the en
dash, not a double hyphen. This was an explicit client request.

**Copy goes in `src/content/`,** read with `useContent()`. Never hardcode
user-facing text in a component, and that includes `aria-label`: a screen reader
is a reader. `fr.js` and `en.js` must stay the same shape down to array lengths;
a dev-only check warns when they drift.

**French punctuation uses a no-break space before `? ! : ;`,** written as the
`\u00A0` escape and never as the character. An invisible space in a source file
is deleted by accident and never noticed. The same applies to the `·`
separator and to `\u202F`, which `Intl` emits in French prices and which Readex
Pro has no glyph for (`formatPrice` swaps it).

**Paths, slugs, filter values and form field names are locale-independent.**
`/boutique` is `/boutique` in both languages because the router matches the
path. Only the visible label translates.

**Navigate with `<Link to>`,** never a bare anchor. It handles client-side
routing, same-page clicks, and external URLs (new tab, `rel="noopener
noreferrer"`).

**Scroll-driven effects subscribe to `onFrame` and write through `write()`.**
Do not start a private `requestAnimationFrame` loop. One loop exists; join it.

**Stateful UI belongs in the URL.** The shop's filters, sort and page are query
params: a filter replaces the history entry, a page change pushes one.

**Every animation needs a `prefers-reduced-motion` fallback,** and the override
must repeat the full selector. See above.

**Every image needs explicit `width` and `height`.** The catalogue photographs
are all 900x675.

**Destructive actions need an undo window,** not a confirmation dialog. Clearing
the basket snapshots it and offers it back for eight seconds.

---

## 4. Security posture

### Current state, verified

- No backend, no API keys, no `.env`, no secrets in source or in `dist/`
- No source maps shipped
- No `dangerouslySetInnerHTML`, no `eval`, no `new Function`, no `innerHTML`
- Every `target="_blank"` carries `rel="noopener noreferrer"`
- Storage is three non-personal keys, every access wrapped

### The forms

No backend. Submitting composes a `mailto:` or a `wa.me` link in the visitor's
own client, so no field value is transmitted by the site. See README for the
protections and what was tested against.

### If you add a backend

Everything currently safe becomes unsafe by default. At minimum: server-side
validation of every field, rate limiting, CSRF tokens, and secrets in
environment variables never prefixed `VITE_`, since anything so prefixed is
inlined into the public bundle.

---

## 5. Do not

- Do not add a second typeface, or a weight above 500.
- Do not add a border radius to anything structural.
- Do not add a box-shadow.
- Do not use an em dash, an en dash or a double hyphen in user-facing copy.
- Do not use uppercase without opening the tracking to match; uppercase at
  default tracking is the one thing worse than sentence case here.
- Do not invent data the catalogue does not have. Two fields are missing and
  both are handled honestly; see README.
- Do not use `IntersectionObserver` with `threshold: 0.5` for anything
  section-sized. A section taller than the viewport never reaches 50% visible,
  so it never fires.
