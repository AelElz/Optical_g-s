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
| `/`                | Seven scroll-pinned chapters, hero through to the shop teaser      |
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
the design system is one stylesheet.

```
src/
  content/      fr.js, en.js, and a dev-only check that they stay the same shape
  data/         products.json, 542 frames from the shop's own API
  lib/          motion, router, locale, cart, forms, format, storage
  hooks/        useReveal, usePanelStack, useScrollProgress, useMediaQuery
  components/   Navbar, Footer, Panel, Kicker, Logo, ProductCard, QuickView, ...
  pages/        one .jsx and one .css each
public/
  fonts/        ReadexPro.woff2
  products/     542 frame photographs
  media/        store, founder, category
```

## Design

The reference is the luxury-house set in `awesome-design-md` (Bugatti,
Ferrari, Lamborghini). What they share is not decoration, it is refusal, and
the whole system here follows from four of those refusals:

- **One typeface at modest weights.** Readex Pro, self-hosted, variable,
  subset to Latin (54 KB). Weights 300, 400 and 500 only. Nothing is bold:
  emphasis comes from size, case and tracking. Labels, buttons, nav links and
  kickers are uppercase at `0.2em`; display type is weight 300 with *negative*
  tracking.
- **Sharp corners.** `--r: 0`. The only rounded thing on the site is the cart
  count, where a square would read as a rendering fault.
- **Hairlines, not shadows.** There is no shadow scale. Depth is photography,
  rules and empty space.
- **One accent, used scarcely.** Gold and white each carry about 40% of the
  surface and ink the remaining 20%, which is also why the site is light by
  default with at most one ink chapter per page.

Every section label is a `<Kicker>`, which puts the spectacles mark in front of
the words. The mark is the brand's own `Logo.svg`, recoloured to `currentColor`
so one component serves the gold, ink and white surfaces.

**No dash as a connector**, anywhere in the copy: not the em dash, not the en
dash, not a double hyphen. A comma, a full stop or the middot separator does
the work, and ranges are written out ("10:00 à 20:00").

## Motion

One `requestAnimationFrame` loop for the whole site, split into a read phase
and a write phase (`src/lib/motion.js`). Lenis is driven from GSAP's ticker so
the smoothed position and every scroll-reading effect resolve in the same
frame. Nothing starts a private rAF loop; effects subscribe to `onFrame` and
push DOM writes through `write()`.

The home page is the only surface with a real motion budget: sticky chaptered
panels, a damped scroll-progress signal (`--p` and `--pd`) driving parallax
and the frame strip, text wipes, and one ambient float. The shop and the forms
are utility surfaces and get a staggered enter and nothing else.

Every animated thing has a `prefers-reduced-motion` fallback, and under that
setting Lenis never starts and `--pd` is pinned to its midpoint so no element
is left displaced.

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

Readex Pro is licensed under the SIL Open Font License, so it ships with the
site. It was subset from the upstream variable file, which also carries a full
Arabic set and a second `HEXP` axis that this site does not use.

An earlier draft used Midstar for display. It is not in the repository: the
available file is the personal-use demo, and the demo watermarks live inside
the glyphs, so every digit, the ampersand and the typographic apostrophe
render as a small "PERSONAL USE ONLY" badge rather than as the character. That
is unusable for a shop that prints prices, phone numbers and opening hours.

## Verification

Read [AGENTS.md](AGENTS.md) before changing anything here. Nearly every bug
found while building this rendered a plausible-looking page, and the ones that
matter are listed there with the symptom each produces.
