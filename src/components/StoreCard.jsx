import { useContent } from '../content'
import { formatPhone, telHref } from '../lib/format'
import { ArrowRight, Clock, Mail, Phone, Pin } from './Icons'
import Link from './Link'
import './StoreCard.css'

/*
 * The shop's own details, in one place.
 *
 * Four pages show this block, and the address is 90 characters of French with
 * a building name and a shop number in it. Written out four times it would be
 * wrong in at least one of them within a month, so all four read the same
 * object out of the content file.
 */
export function StoreCard({ title, tone = 'light', showHours = false }) {
  const t = useContent()
  const { shop } = t

  return (
    <div className={`store store--${tone}`}>
      {title && <h3 className="store__title">{title}</h3>}

      <ul className="store__list">
        <li>
          <Link to={shop.mapsUrl} className="store__row">
            <Pin />
            <span>{shop.address}</span>
          </Link>
        </li>
        {shop.phones.map((phone) => (
          <li key={phone}>
            <Link to={telHref(phone)} className="store__row">
              <Phone />
              <span className="store__num">{formatPhone(phone)}</span>
            </Link>
          </li>
        ))}
        <li>
          <Link to={`mailto:${shop.email}`} className="store__row">
            <Mail />
            <span>{shop.email}</span>
          </Link>
        </li>
        <li>
          <span className="store__row store__row--static">
            <Clock />
            <span>{shop.closedNote}</span>
          </span>
        </li>
      </ul>

      {showHours && <Hours />}
    </div>
  )
}

/*
 * The opening hours table.
 *
 * A real <table>: seven day-and-time pairs are tabular data, and a screen
 * reader announcing "Monday, 10:00 to 20:00" depends on the row association
 * that a stack of divs throws away.
 */
export function Hours({ compact = false, layout = 'stack' }) {
  const t = useContent()
  const { shop } = t

  /*
   * The row layout is a height fix, not a style choice.
   *
   * Seven day-and-time pairs stacked come to 345px, and inside a pinned
   * chapter that is 345px the chapter cannot spend. Laid out as two rows of
   * seven columns it is about 90px and says exactly the same thing.
   *
   * Still a real table either way: the header cells only change axis, so
   * "Monday, 10:00 to 20:00" survives, which a row of divs would not.
   */
  if (layout === 'row') {
    return (
      <div className="hours hours--row">
        <h3 className="hours__title">{shop.hoursTitle}</h3>
        <table className="hours__table hours__table--row">
          <tbody>
            <tr className="hours__days">
              {shop.hours.map((row) => (
                <th scope="col" key={row.day} data-closed={row.closed}>
                  {/* Three letters on a narrow screen, the whole word on a
                      wide one. Both are in the DOM; CSS picks. */}
                  <span className="hours__day-long">{row.day}</span>
                  <span className="hours__day-short" aria-hidden="true">
                    {row.day.slice(0, 3)}
                  </span>
                </th>
              ))}
            </tr>
            <tr className="hours__times">
              {shop.hours.map((row) => (
                <td key={row.day} data-closed={row.closed}>
                  {row.time}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className={`hours${compact ? ' hours--compact' : ''}`}>
      <h3 className="hours__title">{shop.hoursTitle}</h3>
      <table className="hours__table">
        <tbody>
          {shop.hours.map((row) => (
            <tr key={row.day} data-closed={row.closed}>
              <th scope="row">{row.day}</th>
              <td>{row.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/*
 * The map.
 *
 * loading="lazy" is doing real work here, not micro-optimisation: without it
 * a Google iframe, its scripts and its cookies load on first paint of four
 * separate pages, whether or not the visitor ever scrolls down to the map.
 * With it, nothing third-party is fetched until the block is nearly in view.
 */
export function MapEmbed({ label }) {
  const t = useContent()
  const { shop } = t
  const query = encodeURIComponent(shop.address)

  return (
    <div className="map">
      <iframe
        className="map__frame"
        title={label ?? shop.address}
        src={`https://maps.google.com/maps?q=${query}&z=16&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <Link to={shop.mapsUrl} className="map__open">
        {t.home.find.directions}
        <ArrowRight size={14} />
      </Link>
    </div>
  )
}
