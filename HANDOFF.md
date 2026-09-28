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
optician. Six pages, French and English, light and dark, 542 real frames
pulled from the shop's own catalogue API. React 19 + Vite, GSAP for the intro,
Lenis for smooth scroll. No routing library, no UI kit, no CSS framework.

---

## State: complete and verified

Everything the brief asked for is built and passing.

| | |
| --- | --- |
| Six pages | `/` `/boutique` `/boutique/panier` `/rendez-vous` `/a-propos` `/contact` |
| Languages | French (source) and English, switchable, shape-checked in dev |
| Themes | Light, dark, and follow-the-system, with no flash on load |
| Catalogue | 542 frames, filters and sort in the URL, quick view, cart with undo |
| Typeface | Readex Pro only, self-hosted, subset to Latin, 54 KB |
| Verification | 97 automated checks, all passing |

```bash
npm run dev -- --port 5219 --strictPort   # in one shell
./tools/run.sh                            # in another
```

Last full run, all green:

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

## The four rules the design rests on

Taken from the luxury houses in `awesome-design-md` (Bugatti, Ferrari,
Lamborghini). Undoing any one of them undoes the redesign, so they are the
first thing to protect.

1. **One typeface, weights 300 to 500.** Readex Pro. Nothing is bold.
   Emphasis is size, case and tracking. Labels, nav, buttons and kickers are
   uppercase at `0.2em`.
2. **Sharp corners.** `--r: 0`. The cart badge is the only rounded thing.
3. **Hairlines, never shadows.** There is no shadow scale.
4. **One accent, used scarcely.** Gold and white about 40% each, ink 20%.

Plus two client instructions:

- **Every section label carries the logo mark.** Use `<Kicker>`; never write a
  bare `<p className="kicker">`.
- **No dash as a connector in user-facing copy.** Not the em dash, not the en
  dash, not a double hyphen. Ranges are written out ("10:00 à 20:00").

---

## Dark mode, in one page

The colour system is a **semantic layer**, and components must use it rather
than the brand constants:

```
--gold  --white  --ink-brand      never change
--surface --surface-2 --deep      the grounds
--ink --ink-body --ink-muted      the foreground; --ink INVERTS
--invert --invert-text            a block that always contrasts
--plate --plate-dim               where a product photograph sits
--line --line-soft --line-strong  hairlines
--gold-ink --gold-quiet           the accent, at a legible contrast
--scrim --hover-wash --shade-color --map-filter --danger
```

Three blocks in `src/index.css` define them: `:root` (light), a
`prefers-color-scheme: dark` block guarded by `:not([data-theme="light"])`,
and `[data-theme="dark"]`. All three are needed for an explicit choice to beat
the system **in both directions**. The values are written twice on purpose;
keep the two dark lists identical.

Three things to know:

- **Two bands do not follow the theme.** The gold band is gold in both and the
  deep band is dark in both, so each **re-declares the semantic tokens for its
  own subtree** (see "Fixed-colour surfaces" in `index.css`). A component
  dropped into either is then correct without knowing where it is. If text on
  gold looks wrong, the cause is almost always a per-component colour rule
  shadowing that scope; delete the rule rather than adjusting it.
- **The muted alphas are solved, not chosen.** 4.5:1 needs 0.591 on the light
  ground, 0.478 on the dark one, 0.451 on the deep band and 0.652 on gold.
  Every value sits just above its floor, so softening a label breaks AA.
  `tools/contrast.mjs` walks every text node in both themes and will catch it.
- **Product photographs sit on a light plate in both themes.** Keying the
  white ground out to transparency was tried and abandoned: it fails on the
  frames that matter, leaving a bright blob where a rimless lens interior was
  and a hard rectangle on grey-ground shots. `--plate-dim` dims the photograph
  in dark mode so a grid of them does not glare.

The toggle is one button in the nav showing the theme it will switch **to**.
`src/lib/theme.jsx` owns it; an inline script in `index.html` applies the
stored value before first paint and must mirror `apply()` in that file.

---

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
   `Design Assest/` if the commercial licence is bought. Readex Pro is
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
