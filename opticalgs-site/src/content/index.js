import { useLocale } from '../lib/locale-context'
import en from './en'
import fr from './fr'

export const dictionaries = { fr, en }

/* Every component reads its copy through this. Nothing user-facing is
   hardcoded in a component, and that includes aria-label: a screen reader is
   a reader. */
export function useContent() {
  const { locale } = useLocale()
  return dictionaries[locale] ?? dictionaries.fr
}

/*
 * Shape check, development only.
 *
 * The two dictionaries failing apart is the one bug in a bilingual site that
 * produces no error at all: the page renders, the DOM is correct, and one
 * language is simply missing a heading, or has a four-item list where the
 * other has six and quietly drops the last two. Comparing the trees on every
 * dev boot turns that into a console warning the moment it is introduced,
 * which is months before anyone would otherwise notice.
 *
 * Stripped from the production bundle: import.meta.env.DEV is statically
 * false there, so the whole block is dead code and never shipped.
 */
if (import.meta.env.DEV) {
  const differences = []

  const walk = (a, b, path) => {
    const typeA = Array.isArray(a) ? 'array' : typeof a
    const typeB = Array.isArray(b) ? 'array' : typeof b

    if (typeA !== typeB) {
      differences.push(`${path}: fr is ${typeA}, en is ${typeB}`)
      return
    }

    if (typeA === 'array') {
      if (a.length !== b.length) {
        differences.push(`${path}: fr has ${a.length} items, en has ${b.length}`)
        return
      }
      a.forEach((item, index) => walk(item, b[index], `${path}[${index}]`))
      return
    }

    if (typeA !== 'object' || a === null || b === null) return

    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (!(key in a)) differences.push(`${path}.${key}: missing from fr`)
      else if (!(key in b)) differences.push(`${path}.${key}: missing from en`)
      else walk(a[key], b[key], `${path}.${key}`)
    }
  }

  walk(fr, en, 'content')

  if (differences.length) {
    console.warn(
      `[content] fr and en have drifted apart in ${differences.length} place(s):\n` +
        differences.map((line) => `  ${line}`).join('\n'),
    )
  }
}
