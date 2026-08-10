import { createContext, useContext, useEffect } from 'react'
import type { ReactNode } from 'react'
import { ja } from './ja'
import type { Key } from './ja'
import { en } from './en'
import { zh } from './zh'
import { de } from './de'
import { fr } from './fr'
import { it } from './it'
import { es } from './es'
import type { Locale } from './locales'

const dictionaries: Record<Locale, Record<Key, string>> = {
  ja,
  en,
  zh,
  de,
  fr,
  it,
  es,
}

export interface I18nValue {
  locale: Locale
  t: (key: Key) => string
}

const I18nContext = createContext<I18nValue | null>(null)

/** Provides the current locale's dictionary; syncs <html lang> and the
 *  document title with the locale. */
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = locale
    document.title = dictionaries[locale]['site.name']
  }, [locale])
  const value: I18nValue = { locale, t: (key) => dictionaries[locale][key] }
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useT(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useT must be used inside LocaleProvider')
  return ctx
}
