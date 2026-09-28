import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useContent } from '../content'
import allProducts from '../data/products.json'
import { useReveal } from '../hooks/useReveal'
import Footer from '../components/Footer'
import Heading from '../components/Heading'
import Kicker from '../components/Kicker'
import { ArrowRight, Chevron } from '../components/Icons'
import Link from '../components/Link'
import ProductCard from '../components/ProductCard'
import QuickView from '../components/QuickView'
import { resizeScroll, scrollTo } from '../lib/motion'
import './Boutique.css'

const PER_PAGE = 24

/* Four real frames for the head, one from each of four houses. */
const HERO_FRAMES = ['/products/gg1862s-1158.webp', '/products/dior-cannage-1154.webp', '/products/b23-514.webp', '/products/mod2274-1151.webp']
  .map((image) => allProducts.find((product) => product.image === image))
  .filter(Boolean)

/*
 * The filters live in the query string.
 *
 * Held only in component state, a filtered view could not be shared, could
 * not be bookmarked, and the browser's Back button walked out of the shop
 * entirely instead of undoing the last filter. Reading them from the URL also
 * means the quick view can open and close without disturbing any of it.
 */
const DEFAULTS = { genre: 'all', type: 'all', sort: 'recent', page: 1 }

function readParams(search, copy) {
  const params = new URLSearchParams(search)
  const oneOf = (key, options) => {
    const value = params.get(key)
    return options.some((option) => option.value === value) ? value : DEFAULTS[key]
  }
  const page = Number.parseInt(params.get('page') ?? '', 10)
  return {
    genre: oneOf('genre', copy.filters.genre),
    type: oneOf('type', copy.filters.type),
    sort: oneOf('sort', copy.filters.sort),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  }
}

function writeParams(next) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(next)) {
    if (value !== DEFAULTS[key]) params.set(key, String(value))
  }
  const query = params.toString()
  return query ? `?${query}` : window.location.pathname
}

/*
 * "Featured" against real data.
 *
 * The catalogue API returns is_featured false for all 548 products, so there
 * is nothing in the data to sort on. Rather than invent a flag, this option
 * brings the named houses forward, which is a real ordering derived from the
 * brand field the shop actually maintains.
 */
const HOUSES = [
  'GUCCI',
  'DIOR',
  'PRADA',
  'VERSACE',
  'FENDI',
  'BVLGARI',
  'CELINE',
  'GIVENCHY',
  'MIU MIU',
  'BOTTEGA',
  'ALEXANDER MC QUEEN',
  'ROBERTO CAVAL',
  'DOLCE & GABANNA',
  'FRED',
  'GUESS',
  'VOGUE',
]

const houseRank = (brand) => {
  const upper = (brand || '').toUpperCase()
  const index = HOUSES.findIndex((house) => upper.startsWith(house))
  return index === -1 ? HOUSES.length : index
}

/*
 * "mixed" is a real value in the catalogue and it means exactly that: a
 * unisex frame. It has to appear under Men AND under Women, or 126 of 542
 * frames are unreachable from either.
 */
function matchesGenre(product, genre) {
  if (genre === 'all') return true
  if (genre === 'child') return product.genre === 'child'
  return product.genre === genre || product.genre === 'mixed'
}

export default function Boutique() {
  const t = useContent()
  const revealRef = useReveal()
  const gridTopRef = useRef(null)

  const copy = t.boutique

  /* Lazy initialiser: the URL is read once on mount, not on every render. */
  const [state, setState] = useState(() => readParams(window.location.search, copy))
  const [opened, setOpened] = useState(null)
  const { genre, type, sort, page } = state

  /*
   * The current state, mirrored into a ref.
   *
   * `update` needs to read the current value to merge a patch into it, and it
   * must stay stable so the filter callbacks below are not rebuilt on every
   * keystroke. A ref gives it both without listing `state` as a dependency.
   */
  const latest = useRef(state)
  latest.current = state

  /*
   * replaceState for a filter, pushState for a page.
   *
   * Every chip tap would otherwise be a history entry and getting out of the
   * shop would take fifteen presses of Back. Paging does push, because moving
   * between pages of results is a step a visitor expects Back to undo.
   *
   * The history call is deliberately OUTSIDE the state updater. React invokes
   * an updater twice in development StrictMode to surface impure ones, so a
   * pushState in there ran twice and pushed two identical entries: Back
   * appeared to do nothing, because the first press only removed the
   * duplicate. An updater must be a pure function of its argument.
   */
  const update = useCallback((patch, { history = 'replace' } = {}) => {
    const next = { ...latest.current, ...patch }
    latest.current = next
    const url = writeParams(next)
    if (history === 'push') window.history.pushState(null, '', url)
    else window.history.replaceState(null, '', url)
    setState(next)
  }, [])

  /* Back and Forward have to move the filters, not just the URL. */
  useEffect(() => {
    const onPop = () => {
      const next = readParams(window.location.search, copy)
      latest.current = next
      setState(next)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [copy])

  /*
   * The catalogue is 542 items and this runs on every keystroke of a filter
   * change, so it is memoised on the three values that can actually change
   * the result. `allProducts` is a module import and never changes.
   */
  const filtered = useMemo(() => {
    const list = allProducts.filter(
      (product) =>
        matchesGenre(product, genre) && (type === 'all' || product.type === type),
    )

    /*
     * A copy before sorting. Array.prototype.sort mutates in place, and the
     * array here is a slice of the imported module: sorting it directly
     * would permanently reorder the catalogue for every other page in the
     * session, including the home page's marquee.
     */
    const sorted = [...list]

    switch (sort) {
      case 'price-asc':
        // Frames with no price sit at the end of both price sorts rather
        // than heading the ascending one at a fictional zero.
        sorted.sort((a, b) => (a.price || Infinity) - (b.price || Infinity))
        break
      case 'price-desc':
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'featured':
        sorted.sort((a, b) => houseRank(a.brand) - houseRank(b.brand))
        break
      default:
        // The data ships newest first, so "recent" is the natural order.
        break
    }

    return sorted
  }, [genre, type, sort])

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  /*
   * Clamped on read, not corrected in an effect. Narrowing a filter while on
   * page 9 of 23 leaves `page` past the end, and an effect that fixes it
   * afterwards renders one empty frame first.
   */
  const current = Math.min(page, pages)
  const visible = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE)

  /* Any filter change starts again from the first page. Staying on page 9 of
     a result set that now has two pages shows nothing at all. */
  const changeFilter = useCallback(
    (key) => (value) => update({ [key]: value, page: 1 }),
    [update],
  )

  const applyCategory = (category) => {
    update({ genre: category.genre, type: category.type, page: 1 })
    scrollTo('#frames')
  }

  const goToPage = (next) => {
    update({ page: next }, { history: 'push' })
    /*
     * Jump back to the head of the grid. Without it, paging from the bottom
     * of page 3 leaves you at the bottom of page 4, looking at the last row
     * of a set you have not seen the start of.
     *
     * On the next frame, after the new rows have laid out: the grid changes
     * height between pages, and Lenis clamps to a cached document height.
     */
    requestAnimationFrame(() => {
      resizeScroll()
      if (gridTopRef.current) scrollTo(gridTopRef.current)
    })
  }

  const dirty = genre !== 'all' || type !== 'all' || sort !== 'recent'

  /* Paging changes what is on screen without moving the DOM the reveal
     observer is watching, so tell it about the new rows. */
  useEffect(() => {
    resizeScroll()
  }, [current, filtered.length])

  return (
    <div ref={revealRef}>
      <main id="top" className="shop">
        {/* Head: the ink stage, the offer, and four real frames on plates. */}
        <section className="shop-hero" data-surface="ink">
          <div className="container shop-hero__grid">
            <div className="shop-hero__copy">
              <p className="shop-hero__badge reveal">{copy.hero.badge}</p>
              <Heading
                as="h1"
                className="h1 shop-hero__title"
                text={copy.hero.title}
                accent={copy.hero.accent}
              />
              <p className="lead reveal" style={{ '--i': 1 }}>
                {copy.hero.lede}
              </p>
              <p className="reveal" style={{ '--i': 2 }}>
                <Link to="/boutique#frames" className="btn btn--primary">
                  <span>{copy.hero.cta}</span>
                  <ArrowRight className="btn__icon" />
                </Link>
              </p>
            </div>

            <div className="shop-hero__plates" aria-hidden="true">
              {HERO_FRAMES.map((product, index) => (
                <span className="shop-hero__plate reveal" key={product.id} style={{ '--i': index }}>
                  <img src={product.image} alt="" width="900" height="675" decoding="async" />
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="shop-cats" data-surface="white">
          <div className="container">
            <div className="section-grid shop-cats__head">
              <Kicker className="reveal">{copy.categories.kicker}</Kicker>
              <Heading className="h2" text={copy.categories.title} />
            </div>

            <ul className="shop-cats__grid">
              {copy.categories.items.map((category, index) => (
                /* Keyed on `key`, which is locale-independent, never on the
                   label: the label is copy, and keying on it remounts every
                   tile on a language switch. */
                <li key={category.key} className="reveal" style={{ '--i': index % 6 }}>
                  <button
                    type="button"
                    className="shop-cats__tile"
                    onClick={() => applyCategory(category)}
                  >
                    <span className="shop-cats__media">
                      <img
                        src={`/media/cat-${category.key}.webp`}
                        alt=""
                        width="900"
                        height="675"
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                    <span className="shop-cats__label">
                      <span>{category.label}</span>
                      <ArrowRight size={14} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Filters and grid */}
        <section className="frames" id="frames" data-surface="stone" ref={gridTopRef}>
          <div className="filters">
            <div className="container filters__inner">
              <FilterGroup
                label={copy.filters.genreLabel}
                options={copy.filters.genre}
                value={genre}
                onChange={changeFilter('genre')}
              />
              <FilterGroup
                label={copy.filters.typeLabel}
                options={copy.filters.type}
                value={type}
                onChange={changeFilter('type')}
              />

              <div className="filters__group filters__group--sort">
                <label className="filters__label" htmlFor="sort">
                  {copy.filters.sortLabel}
                </label>
                <select
                  id="sort"
                  className="field__control filters__select"
                  value={sort}
                  onChange={(event) => changeFilter('sort')(event.target.value)}
                >
                  {copy.filters.sort.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="container">
            <div className="frames__meta">
              <span className="frames__count tnum" aria-live="polite">
                {copy.filters.results(filtered.length)}
              </span>
              {dirty && (
                <button type="button" className="frames__reset" onClick={() => update(DEFAULTS)}>
                  {copy.filters.reset}
                </button>
              )}
            </div>

            {visible.length === 0 ? (
              <p className="frames__empty">{copy.filters.empty}</p>
            ) : (
              <ul className="frames__grid">
                {visible.map((product, index) => (
                  <li key={product.id}>
                    <ProductCard product={product} index={index} onOpen={setOpened} />
                  </li>
                ))}
              </ul>
            )}

            {pages > 1 && (
              <Pagination
                copy={copy.pagination}
                page={current}
                pages={pages}
                onGo={goToPage}
              />
            )}
          </div>
        </section>
      </main>

      <QuickView product={opened} onClose={() => setOpened(null)} />
      <Footer />
    </div>
  )
}

/*
 * A radio group, semantically, drawn as chips.
 *
 * role="radiogroup" with aria-checked rather than a row of buttons: these are
 * mutually exclusive choices, and a screen reader announcing "All, radio
 * button, 1 of 4, selected" is the whole state in one phrase.
 */
function FilterGroup({ label, options, value, onChange }) {
  return (
    <div className="filters__group">
      <span className="filters__label" id={`filter-${label}`}>
        {label}
      </span>
      <div className="filters__chips" role="radiogroup" aria-labelledby={`filter-${label}`}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            className="chip"
            data-active={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/*
 * Pagination with an elision.
 *
 * 23 pages of numbers is a wall, so this shows the first, the last, and a
 * window of three around the current page. The gaps are rendered as text and
 * hidden from the reader, which already has the page count from the buttons.
 */
function Pagination({ copy, page, pages, onGo }) {
  const numbers = []
  for (let n = 1; n <= pages; n += 1) {
    if (n === 1 || n === pages || Math.abs(n - page) <= 1) numbers.push(n)
    else if (numbers[numbers.length - 1] !== '…') numbers.push('…')
  }

  return (
    <nav className="pager" aria-label={copy.page(page)}>
      <button
        type="button"
        className="pager__step"
        onClick={() => onGo(page - 1)}
        disabled={page <= 1}
      >
        <Chevron className="pager__prev" size={12} />
        <span>{copy.previous}</span>
      </button>

      <ul className="pager__list">
        {numbers.map((n, index) =>
          n === '…' ? (
            <li key={`gap-${index}`} className="pager__gap" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={n}>
              <button
                type="button"
                className="pager__num"
                data-active={n === page}
                aria-current={n === page ? 'page' : undefined}
                aria-label={copy.page(n)}
                onClick={() => onGo(n)}
              >
                {n}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        className="pager__step"
        onClick={() => onGo(page + 1)}
        disabled={page >= pages}
      >
        <span>{copy.next}</span>
        <Chevron size={12} />
      </button>
    </nav>
  )
}
