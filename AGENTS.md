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

A pinned element (the shop's filter bar, the service deck) reports `top: 0`
from `getBoundingClientRect()` **and** a shifted `offsetTop`. Resolving a scroll target from either means "scroll to where you
already are".

Use `documentTop()` in `src/lib/motion.js`, which rebuilds the true position
from the flow: container top plus the heights of preceding siblings. Heights are
unaffected by pinning.

*Symptom: an in-page nav link does nothing.*

### `html` and `body` must stay free of `overflow`

`position: sticky` is silently ignored if **any** ancestor has
`overflow: hidden/clip/auto/scroll`. The service deck on the home page and
the shop's filter bar are sticky.

*Symptom: the deck stops stacking and the filters scroll away, with no error.*

### A media query adds no specificity

`@media (prefers-reduced-motion: reduce) { .ticker__track { animation: none } }`
would lose to a more specific rule outside it. **Reduced-motion overrides must
repeat the full selector that turned the effect on.**

*Symptom: the motion keeps running for exactly the people who asked it not to.*

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

**Tokens first.** Every colour, size, radius, space and duration is a token in
`src/styles/tokens.css`, in three tiers: primitives (`--gold-500`,
`--ink-900`), semantics (`--bg`, `--fg`, `--fg-muted`, `--accent`, `--line`,
`--action-bg`), and component knobs (`--btn-h`, `--radius-media`). Components
read semantics, never primitives and never raw values. To re-skin, change
primitives; to change corners, change `--radius-media` and `--radius-card`.

**Surfaces, not themes.** Every section carries `data-surface` (`ink`, `deep`,
`gold`, `white`, `stone`). The attribute re-declares the semantic tokens for
its subtree, so a component is correct on any ground without knowing where it
is. The header reads the same attribute under its midline and wears it, which
is how it turns from white-on-ink to ink-on-stone as you scroll. A new section
without `data-surface` leaves the header guessing.

**The Devorise grammar, in Optical G&S colours.** Display headings are
uppercase Montserrat 700 through `<Heading>`, which adds the gold full stop
and colours the `accent` substring from the content file. Actions are pills.
Photographs and plates have soft corners (the owner asked for no hard edges on
photos). One gold stage per page at most.

**One motion idea: focus.** Entrances are focus pulls (blur to sharp), the
statement on Home and the intro on About come into focus word by word
(`<FocusText>`), and the hero lens pulls focus between real frames. Do not add
unrelated entrance styles.

**Every section label is a `<Kicker>`,** which carries the spectacles mark
(client rule). It sits in the margin column of `.section-grid`, beside the
heading, not stacked above it.

**No dash as a connector in user-facing copy.** Not the em dash, not the en
dash, not a double hyphen. This was an explicit client request.

**Copy goes in `src/content/`,** read with `useContent()`. Never hardcode
user-facing text in a component, and that includes `aria-label`. `fr.js` and
`en.js` must stay the same shape down to array lengths; a dev-only check warns
when they drift.

**French punctuation uses a no-break space before `? ! : ;`,** written as the
`\u00A0` escape and never as the character.

**Paths, slugs, filter values and form field names are locale-independent.**

**Navigate with `<Link to>`,** never a bare anchor. The router matches the
pathname only, so `/boutique?genre=female#frames` renders the shop.

**Scroll-driven effects subscribe to `onFrame` and write through `write()`.**
Do not start a private `requestAnimationFrame` loop.

**Stateful UI belongs in the URL.** The shop's filters, sort and page are query
params: a filter replaces the history entry, a page change pushes one.

**Every animation needs a `prefers-reduced-motion` fallback,** and the override
must repeat the full selector. Anything that moves for more than five seconds
(ticker, hero lens) has a pause control.

**Frame photographs sit on white plates** (`--plate`). A few catalogue shots
are on a grey studio ground; the home rail, hero lens and About plates use
hand-picked clean cut-outs, listed by image path in each page.

**Every image needs explicit `width` and `height`.** Frames are 900x675.

**Destructive actions need an undo window,** not a confirmation dialog.

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

- Do not write a raw colour, size or duration in a component stylesheet; add
  or use a token.
- Do not add a section without `data-surface`.
- Do not add a second typeface.
- Do not use an em dash, an en dash or a double hyphen in user-facing copy.
- Do not use uppercase without opening the tracking to match, except display
  headings, which are uppercase at negative tracking by design.
- Do not invent data the catalogue does not have. Two fields are missing and
  both are handled honestly; see README.
- Do not use `IntersectionObserver` with `threshold: 0.5` for anything
  section-sized.
