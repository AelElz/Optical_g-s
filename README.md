# Optical G&S

A recreation of [opticalgs.com](https://www.opticalgs.com) for the Casablanca
optician: six pages, the real catalogue, French and English.

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # dist/
```

## Pages

| Route              | What it is                                                        |
| ------------------ | ----------------------------------------------------------------- |
| `/`                | Ink hero with the frame lens, houses ticker, store statement, categories, a buyable rail, the gold services stage and deck, founder and booking, the store |
| `/boutique`        | 542 frames, filters and sort in the URL, 24 a page, quick view     |
| `/boutique/panier` | Basket, checkout, cash on delivery, undo on clear                  |
| `/rendez-vous`     | Booking request, four services, Sunday refused                     |
| `/a-propos`        | The brand, the four commitments, the selection, the store          |
| `/contact`         | Message form, map, directions                                      |

Anything else renders `NotFound`. Dead links point at their real path rather
than being redirected somewhere they were never asked to go.

## Stack

React 19, Vite 7, GSAP (the intro only) and Lenis (smooth scroll). No routing
library, no UI kit, no CSS framework: six routes are a `pathname` in state, and
the design system is one token file (`src/styles/tokens.css`) plus base styles.

```
src/
  content/      fr.js, en.js, and a dev-only check that they stay the same shape
  data/         products.json, 542 frames from the shop's own API
  lib/          motion, router, locale, cart, forms, format, storage
  hooks/        useReveal, usePanelStack, useScrollProgress, useMediaQuery
  components/   Navbar, Footer, Panel, Kicker, Logo, ProductCard, QuickView, ...
  pages/        one .jsx and one .css each
public/
  fonts/        Montserrat.woff2
  products/     542 frame photographs
  media/        store, founder, category
```

## Design

Redesigned on 2026-09-28 after the Devorise Media site, carried in the Optical
G&S brand colours (gold `#E8C351`, ink `#14171A`, white). The full record is
[DESIGN.md](DESIGN.md); the short version:

- **Stages and floors.** Home and About open on dark ink stages with bold
  uppercase Montserrat headlines, a gold accent word and a gold full stop.
  The shop, cart and forms are light stone and white floors: the same type,
  buttons and colours, none of the drama, so buying stays fast.
- **One gold stage per page**, full bleed, handing over to white through
  bands that close as you scroll.
- **Pills and soft corners.** Every action is a pill; photographs, frame
  plates and cards have rounded corners.
- **The optician's details.** Every frame carries its size as an optician
  reads it off the temple, `54□16 142`, and the site's motion is a focus pull.
- **Tokens.** Everything visual lives in `src/styles/tokens.css`, in three
  tiers (primitives, semantics, components), with per-surface overrides
  through `data-surface`.

Every section label is a `<Kicker>`, which puts the spectacles mark in front of
the words (client rule).

**No dash as a connector**, anywhere in the copy: not the em dash, not the en
dash, not a double hyphen (client rule).

## Motion

One `requestAnimationFrame` loop for the whole site (`src/lib/motion.js`),
with Lenis driven from GSAP's ticker. Effects subscribe to `onFrame` and push
DOM writes through `write()`.

The motion idea is focus: entrances blur to sharp, the store statement and
the About intro come into focus word by word (`FocusText`), and the hero lens
pulls focus between real frames. The home page also has the houses ticker,
slow parallax on the store photographs, the gold bands and the sticky service
deck. The shop and forms get the entrance and nothing else. Everything has a
`prefers-reduced-motion` fallback, and the ticker and lens have pause controls.

## Content

`src/content/fr.js` is the source language and carries the shop's own wording.
`en.js` must stay the same shape down to array lengths; a dev-only walk of both
trees warns in the console the moment they drift.

Locale lives above the router, so switching language keeps you on the page you
were reading. Paths, filter values and city names are deliberately not
translated: the router matches the path and the filters match the value.

## Data

`products.json` is 542 frames pulled from `api.gs.icamob.ma`, the shop's own
public catalogue API, with brand, reference, price, gender, type, colour,
material, lens/bridge/temple measurements and stock. Every photograph was
trimmed to its subject and re-canvased to a 4:3 frame filling 86% of it, so
every frame on the site is presented at the same relative size.

Two fields the API does not have are handled honestly rather than invented:

- **Featured** returns false for all 548 products, so the "featured" sort
  orders by named house instead, which is real data from the brand field.
- **UV** has no flag anywhere in the catalogue, so the type filter offers
  prescription and sunglasses only. The UV category tile points at
  prescription frames.

## Forms and security

There is no backend. Every form composes a message in the visitor's own mail
client or in WhatsApp, so no field value is transmitted by this site.

Protections, all in `src/lib/forms.js`: a honeypot field, a three-second
minimum fill time, a length cap per field, and control characters stripped
before the URL is composed. `encodeURIComponent` already escapes CR, LF and
`&`, so a value cannot forge a `&bcc=` parameter; the stripping is defence in
depth so safety does not rest on one call staying where it is.

Tested against CRLF injection, `&bcc=` forgery, a null byte, a 5000-character
flood and a script tag. In every case the resulting URL carried only `subject`
and `body`.

Storage is three keys and none is personal: `opticalgs:locale`,
`opticalgs:cart` (product ids and quantities, never a copy of a price) and a
`sessionStorage` flag for the intro. Every access is wrapped, because
`localStorage` throws outright in Safari's private mode.

**If a backend is added, everything currently safe becomes unsafe by default.**
At minimum: server-side validation of every field (the client caps are a UX
affordance, not a control), rate limiting, CSRF tokens, and secrets in
environment variables never prefixed `VITE_`, since anything so prefixed is
inlined into the public bundle.

## Fonts

Montserrat (SIL Open Font License), variable, self-hosted as
`public/fonts/Montserrat.woff2`, Latin subset. It is the Devorise Media
typeface, chosen because the redesign follows that site.

The Midstar file in `Design Assest/` is the personal-use demo, whose glyphs
carry "PERSONAL USE ONLY" watermarks on digits and punctuation, so it is not
used.

## Verification

Read [AGENTS.md](AGENTS.md) before changing anything here. Nearly every bug
found while building this rendered a plausible-looking page, and the ones that
matter are listed there with the symptom each produces.
