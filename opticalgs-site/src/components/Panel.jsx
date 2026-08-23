/*
 * One chapter of the stack.
 *
 * The DOM shape matters and is why this is a component rather than a class
 * name used by hand: usePanelStack queries `.panel` and measures
 * `.panel__inner`, so a panel written without the inner would be measured on
 * its own empty dwell space and pin in the wrong place.
 *
 * `dwell` is the empty scroll distance below the scene that holds the chapter
 * still long enough to read. A chapter whose content is already taller than
 * the viewport pins at its own bottom and wants none.
 */
export default function Panel({
  tone = 'light',
  id,
  dwell,
  className = '',
  children,
  ...rest
}) {
  const style = dwell === undefined ? undefined : { '--dwell': dwell }

  return (
    <section
      id={id}
      className={`panel panel--${tone} ${className}`.trim()}
      style={style}
      {...rest}
    >
      {tone === 'ink' && <span className="panel__grain" aria-hidden="true" />}
      <div className="panel__inner">{children}</div>
      {/* Painted over the scene, so it dims the content and not just the
          background. JS drives --shade from the next panel's position. */}
      <span className="panel__shade" aria-hidden="true" />
    </section>
  )
}
