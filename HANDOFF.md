# Handoff

Start here in a new session. Read this, then [AGENTS.md](AGENTS.md) before
changing anything, then [README.md](README.md) for the stack.

---

## Where things are

```
/Users/ayoub/Documents/Moktar/ObticalGS website/
├─ Optical_g-s/          ← THE PROJECT (git repo, this file)
│  ├─ src/  public/  tools/  dist/
│  └─ Design Assest/     brand SVGs, the Midstar demo font
├─ awesome-design-md/    73 DESIGN.md systems, the luxury reference
├─ SKILL.md              the Vercel Web Interface Guidelines review skill
└─ opticalgs-site/       EMPTY. An old path, safe to delete.
```

The project was renamed from `opticalgs-site` to `Optical_g-s` partway
through. Anything still pointing at the old path is stale.

```bash
cd "/Users/ayoub/Documents/Moktar/ObticalGS website/Optical_g-s"
npm install
npm run dev -- --port 5219 --strictPort    # http://localhost:5219
npm run build
```

---

## What it is

A recreation of [opticalgs.com](https://www.opticalgs.com) for a Casablanca
optician. Six pages, French and English, 542 real frames pulled from the shop's own
catalogue API. React 19 + Vite, GSAP for the intro, Lenis for smooth scroll.
Redesigned on 2026-09-28 in the Devorise Media design language (see
DESIGN.md and PRODUCT.md). No routing library, no UI kit, no CSS framework.

---

## State: complete and verified

Everything the brief asked for is built and passing.

| | |
| --- | --- |
| Six pages | `/` `/boutique` `/boutique/panier` `/rendez-vous` `/a-propos` `/contact` |
| Languages | French (source) and English, switchable, shape-checked in dev |
| Catalogue | 542 frames, filters and sort in the URL, quick view, cart with undo |
| Typeface | Montserrat only, variable, self-hosted, subset to Latin, 38 KB |
| Verification | 97 automated checks, all passing |

```bash
npm run dev -- --port 5219 --strictPort   # in one shell
./tools/run.sh                            # in another
```

Last full run, all green. **This run predates the 2026-09-28 redesign:** the
scripts in `tools/` target the old markup (the panel stack, the nav pill, the
theme toggle) and need updating before they mean anything again.

```
checks     10 passed, 0 failed     sticky stack, nav, deep links, cart
forms      22 passed, 0 failed     CRLF and bcc injection, honeypot, validation
rm          7 passed, 0 failed     prefers-reduced-motion
a11y       40 passed, 0 failed     focus trap, headings, alt, 24px targets
state      18 passed, 0 failed     URL filters, Back, cart undo
contrast   every text node meets WCAG AA in both themes
console    no warnings or errors on any page
```

`tools/run.sh` installs `playwright-core` on demand and drives a local
Chromium. It is not a dependency of the site. It defaults to Brave; point
`BROWSER_PATH` at any Chromium if you have a different one.

---

## The design, in one page

Read [DESIGN.md](DESIGN.md) for the full system and [PRODUCT.md](PRODUCT.md)
for the product facts the owner confirmed.

- **Tokens** in `src/styles/tokens.css`: primitives, then semantics, then
  component knobs. Components read semantics only.
- **Surfaces** through `data-surface` (`ink`, `deep`, `gold`, `white`,
  `stone`), which re-declare the semantic tokens; the header wears whichever
  surface is under it. There is no light/dark toggle any more (dropped with the
  owner's agreement).
- **Devorise grammar in G&S colours:** uppercase Montserrat display with a gold
  accent word and full stop (`<Heading>`), pills, one gold stage per page,
  margin labels (`<Kicker>`, with the logo mark: client rule), soft corners on
  photos (owner's request).
- **Client rules kept:** the logo mark before every section label, no dash as
  a connector in copy.

## Two places where the data is thin, handled honestly

The catalogue API has no value for either, so neither is invented. Do not
"fix" these by making something up.

- **Featured** is false for all 548 products, so the featured sort orders by
  named house instead, from the real brand field.
- **UV** has no flag at all, so the type filter offers prescription and
  sunglasses only, and the UV category tile points at prescription frames.

---

## Open items

Nothing is broken. These are judgement calls left for you or the client.

1. **`node_modules/` and `dist/` are tracked in git.** 2,616 and 558 files, so
   3,174 of the 3,810 tracked files are build output and dependencies.
   `.gitignore` now lists both, but the committed copies are still in the
   index, so they keep showing up as modified. Dropping them:

   ```bash
   git rm -r --cached node_modules dist
   ```

   Left undone deliberately: it is a large, history-rewriting change to a
   repo the client created, and it is their call.
2. **The Midstar font is not used.** The supplied file is the personal-use
   demo and its watermarks are inside the glyphs: every digit, the ampersand
   and the apostrophe render as a "PERSONAL USE ONLY" badge, which is unusable
   for a shop that prints prices and phone numbers. It is still in
   `Design Assest/` if the commercial licence is bought. Montserrat is
   OFL-licensed and ships with the site.
3. **No backend.** Every form composes a `mailto:` or `wa.me` link in the
   visitor's own client. If one is added, everything currently safe becomes
   unsafe by default; see the security section of README.md.
4. **Deliberately skipped from the Vercel guidelines**, as low value here:
   placeholders ending in `…`, `translate="no"` on brand names, list
   virtualization (24 cards a page), and a `beforeunload` guard on
   half-filled forms.
5. **The founder photograph has a forest background** that does not match the
   rest of the photography. It is the client's own image; replacing it is
   their call.

---

## If you change something, measure it

Nearly every real bug found here rendered a plausible-looking page: images
laid out at 0×0, a history entry pushed twice, a chapter whose title was cut
off only once it pinned, grain that ignored Reduce Motion. None of them were
visible in a screenshot.

`AGENTS.md` lists each one with the symptom it produces. Read it before
touching the panel stack, the nav indicator, the forms or the token layer.
