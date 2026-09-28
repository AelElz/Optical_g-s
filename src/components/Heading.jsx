/*
 * A display heading in the Devorise manner: uppercase, bold, one word in the
 * accent colour, and a full stop in the accent colour at the end.
 *
 * The copy stays in sentence case in the content files; CSS sets the case, so
 * a screen reader reads words rather than spelling capitals. The accent is a
 * substring of the copy (`accent` in the content file) and is simply skipped
 * when a translation does not contain it. A heading that already ends on its
 * own punctuation (a question) gets no stop.
 */
export default function Heading({
  as: Tag = 'h2',
  text,
  accent,
  className = 'h2',
  wipe = true,
  stop = true,
  ...rest
}) {
  const at = accent ? text.indexOf(accent) : -1
  const body =
    at === -1 ? (
      text
    ) : (
      <>
        {text.slice(0, at)}
        <em className="accent">{accent}</em>
        {text.slice(at + accent.length)}
      </>
    )

  const ends = /[.?!…]$/.test(text.trim())
  const content = (
    <>
      {body}
      {stop && !ends && (
        <span className="stop" aria-hidden="true">
          .
        </span>
      )}
    </>
  )

  return (
    <Tag className={className} {...rest}>
      {wipe ? (
        <span className="wipe">
          <span>{content}</span>
        </span>
      ) : (
        content
      )}
    </Tag>
  )
}
