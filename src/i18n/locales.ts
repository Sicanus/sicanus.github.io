export const LOCALES = ['ja', 'en', 'zh', 'de', 'fr', 'it', 'es'] as const
export type Locale = (typeof LOCALES)[number]

export const isLocale = (s: string | undefined): s is Locale =>
  LOCALES.some((l) => l === s)

/** Language detection: the seven supported languages by navigator prefix,
 *  everything else falls back to English. */
export function detectLocale(): Locale {
  const lang = navigator.language.toLowerCase()
  if (lang.startsWith('zh')) return 'zh'
  if (lang.startsWith('ja')) return 'ja'
  if (lang.startsWith('en')) return 'en'
  if (lang.startsWith('de')) return 'de'
  if (lang.startsWith('fr')) return 'fr'
  if (lang.startsWith('it')) return 'it'
  if (lang.startsWith('es')) return 'es'
  return 'en'
}

/** First path segment if it is a locale; otherwise the detected default. */
export function localeFromPath(pathname: string): Locale {
  const seg = pathname.split('/')[1]
  return isLocale(seg) ? seg : detectLocale()
}
