import type { Locale } from './locales'

/** Format a frontmatter YYYY-MM-DD date in the given locale. The parts
 *  are parsed and rebuilt in local time — constructing from the raw
 *  string would parse as UTC and shift a day for negative-offset
 *  visitors. */
export function formatDate(dateStr: string, locale: Locale): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(y, m - 1, d))
}
