/*
 * Every icon on the site, inline.
 *
 * Inline rather than a sprite or an icon font because they all inherit
 * currentColor, so a single mark works on the gold panel, the ink panel and
 * the white one without a second copy. Nothing here is decorative enough to
 * be worth a network request.
 *
 * All of them are aria-hidden: an icon that sits next to its own label is
 * announced twice otherwise, and an icon that sits alone is given the label
 * by the button around it.
 */

const base = {
  'aria-hidden': 'true',
  focusable: 'false',
  xmlns: 'http://www.w3.org/2000/svg',
  fill: 'none',
}

/*
 * The Optical G&S mark: a pair of round spectacles whose left lens opens into
 * a G and whose right lens closes into an S.
 *
 * This is the brand's own Logo.svg, unaltered except that the three colour
 * variants collapse into one component filled with currentColor, so the same
 * geometry serves the gold, ink and white surfaces.
 *
 * The viewBox is trimmed to the artwork (179 x 71, so about 2.5:1). An
 * earlier version of this file re-cropped a 300 x 300 export by hand and got
 * the proportions wrong; the supplied file is the source of truth.
 */
const MARK_RATIO = 179 / 71

export function Mark({ height = 22, ...rest }) {
  return (
    <svg
      {...base}
      viewBox="0 0 179 71"
      width={Math.round(height * MARK_RATIO)}
      height={height}
      {...rest}
    >
      <path
        fill="currentColor"
        d="M44.5464 0C57.8803 4.4867e-05 69.4949 7.35282 75.563 18.2236L68.4468 20.3457C63.4269 12.4459 54.5991 7.20317 44.5464 7.20312C28.9186 7.20326 16.2497 19.8722 16.2495 35.5C16.2495 50.8838 28.5256 63.4005 43.8159 63.7881L44.5464 63.7979C56.4257 63.7978 66.5952 56.4771 70.7905 46.1016L70.9858 45.6055C71.1597 45.1509 71.3204 44.6901 71.4712 44.2246L79.479 41.8359C79.0845 44.0234 78.4918 46.1447 77.7144 48.1777C72.6152 61.5115 59.6975 70.9999 44.5464 71C24.9403 70.9999 9.04639 55.1061 9.04639 35.5C9.04659 15.8941 24.9404 0.000134004 44.5464 0Z"
      />
      <circle cx="134.07" cy="35.5002" r="31.8986" stroke="currentColor" strokeWidth="7.20304" />
      <path
        d="M67.416 16.3658C67.416 16.3658 92.2201 9.93661 106.965 16.9281"
        stroke="currentColor"
        strokeWidth="8.23205"
      />
      <rect
        fill="currentColor"
        x="1.3584"
        y="25.7803"
        width="10.4963"
        height="5.24815"
        rx="1.12463"
        transform="rotate(15 1.3584 25.7803)"
      />
      <rect
        fill="currentColor"
        x="167.535"
        y="25.5083"
        width="11.5504"
        height="5.24815"
        rx="1.12463"
        transform="rotate(15 167.535 25.5083)"
      />
    </svg>
  )
}

const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function ArrowRight({ size = 15, ...rest }) {
  return (
    <svg {...base} viewBox="0 0 16 16" width={size} height={size} {...rest}>
      <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" {...stroke} />
    </svg>
  )
}

export function ArrowDown({ size = 15, ...rest }) {
  return (
    <svg {...base} viewBox="0 0 16 16" width={size} height={size} {...rest}>
      <path d="M8 2.5v11M3.5 9 8 13.5 12.5 9" {...stroke} />
    </svg>
  )
}

export function Chevron({ size = 14, ...rest }) {
  return (
    <svg {...base} viewBox="0 0 16 16" width={size} height={size} {...rest}>
      <path d="m5.5 3 5 5-5 5" {...stroke} />
    </svg>
  )
}

export function Close({ size = 16, ...rest }) {
  return (
    <svg {...base} viewBox="0 0 16 16" width={size} height={size} {...rest}>
      <path d="m3.5 3.5 9 9m0-9-9 9" {...stroke} />
    </svg>
  )
}

export function Plus({ size = 14, ...rest }) {
  return (
    <svg {...base} viewBox="0 0 16 16" width={size} height={size} {...rest}>
      <path d="M8 3v10M3 8h10" {...stroke} />
    </svg>
  )
}

export function Minus({ size = 14, ...rest }) {
  return (
    <svg {...base} viewBox="0 0 16 16" width={size} height={size} {...rest}>
      <path d="M3 8h10" {...stroke} />
    </svg>
  )
}

export function Bag({ size = 18, ...rest }) {
  return (
    <svg {...base} viewBox="0 0 20 20" width={size} height={size} {...rest}>
      <path d="M4 6.5h12l-.9 10a1.5 1.5 0 0 1-1.5 1.4H6.4a1.5 1.5 0 0 1-1.5-1.4Z" {...stroke} />
      <path d="M7.2 8.4V5.6a2.8 2.8 0 0 1 5.6 0v2.8" {...stroke} />
    </svg>
  )
}

export function Pin({ size = 17, ...rest }) {
  return (
    <svg {...base} viewBox="0 0 20 20" width={size} height={size} {...rest}>
      <path d="M10 18s6-5.1 6-9.4A6 6 0 0 0 4 8.6C4 12.9 10 18 10 18Z" {...stroke} />
      <circle cx="10" cy="8.5" r="2.3" {...stroke} />
    </svg>
  )
}

export function Phone({ size = 17, ...rest }) {
  return (
    <svg {...base} viewBox="0 0 20 20" width={size} height={size} {...rest}>
      <path
        d="M6.6 3.2 8.2 6 6.9 7.9a9.4 9.4 0 0 0 5.2 5.2L14 11.8l2.8 1.6-.5 2.4a1.4 1.4 0 0 1-1.6 1.1C8.4 15.9 4.1 11.6 3.1 5.3a1.4 1.4 0 0 1 1.1-1.6Z"
        {...stroke}
      />
    </svg>
  )
}

export function Mail({ size = 17, ...rest }) {
  return (
    <svg {...base} viewBox="0 0 20 20" width={size} height={size} {...rest}>
      <rect x="2.6" y="4.6" width="14.8" height="10.8" rx="2" {...stroke} />
      <path d="m3.4 6 6.6 4.6L16.6 6" {...stroke} />
    </svg>
  )
}

export function Clock({ size = 17, ...rest }) {
  return (
    <svg {...base} viewBox="0 0 20 20" width={size} height={size} {...rest}>
      <circle cx="10" cy="10" r="7.2" {...stroke} />
      <path d="M10 5.8V10l2.8 1.8" {...stroke} />
    </svg>
  )
}

export function Instagram({ size = 18, ...rest }) {
  return (
    <svg {...base} viewBox="0 0 20 20" width={size} height={size} {...rest}>
      <rect x="3" y="3" width="14" height="14" rx="4.2" {...stroke} />
      <circle cx="10" cy="10" r="3.4" {...stroke} />
      <circle cx="14.1" cy="5.9" r="0.95" fill="currentColor" />
    </svg>
  )
}

export function Facebook({ size = 18, ...rest }) {
  return (
    <svg {...base} viewBox="0 0 20 20" width={size} height={size} {...rest}>
      <path
        d="M11.6 17.5v-6.2h2.1l.4-2.5h-2.5V7.2c0-.7.2-1.2 1.2-1.2h1.3V3.7A16 16 0 0 0 12.2 3.6c-1.9 0-3.2 1.2-3.2 3.3v1.9H6.9v2.5H9v6.2Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function WhatsApp({ size = 18, ...rest }) {
  return (
    <svg {...base} viewBox="0 0 20 20" width={size} height={size} {...rest}>
      <path
        d="M10 2.8a7.1 7.1 0 0 0-6.1 10.7L3 17.2l4-1a7.1 7.1 0 1 0 3-13.4Z"
        {...stroke}
      />
      <path
        d="M7.6 6.7c.2-.1.6-.1.8.2l.7 1.2c.1.3 0 .5-.2.7l-.4.4c.5.9 1.2 1.6 2.1 2l.4-.4c.2-.2.5-.3.7-.2l1.2.7c.3.2.3.6.2.8-.4.7-1.3 1-2 .8a7.7 7.7 0 0 1-4.5-4.5c-.2-.7.1-1.5.8-1.9Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  )
}

export function Sun({ size = 17, ...rest }) {
  return (
    <svg {...base} viewBox="0 0 20 20" width={size} height={size} {...rest}>
      <circle cx="10" cy="10" r="3.6" {...stroke} />
      <path
        d="M10 1.6v2.1M10 16.3v2.1M18.4 10h-2.1M3.7 10H1.6M15.9 4.1l-1.5 1.5M5.6 14.4l-1.5 1.5M15.9 15.9l-1.5-1.5M5.6 5.6 4.1 4.1"
        {...stroke}
      />
    </svg>
  )
}

export function Moon({ size = 17, ...rest }) {
  return (
    <svg {...base} viewBox="0 0 20 20" width={size} height={size} {...rest}>
      <path d="M16.5 12.4A7.1 7.1 0 0 1 7.6 3.5a7.1 7.1 0 1 0 8.9 8.9Z" {...stroke} />
    </svg>
  )
}

/* Looked up by name so the social list can stay data in the content file. */
export const socialIcons = {
  Instagram,
  Facebook,
  WhatsApp,
}
