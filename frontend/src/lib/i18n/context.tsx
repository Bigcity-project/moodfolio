'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { en } from './en'
import { zhTW } from './zh-TW'

export type Locale = 'en' | 'zh-TW'

const translationMap: Record<Locale, Record<string, string>> = {
  en,
  'zh-TW': zhTW,
}

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const saved = localStorage.getItem('moodfolio-locale')
    if (saved === 'en' || saved === 'zh-TW') {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('moodfolio-locale', newLocale)
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let text = translationMap[locale]?.[key] ?? translationMap.en[key] ?? key
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replaceAll(`{${k}}`, String(v))
        }
      }
      return text
    },
    [locale]
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslation must be used within a LocaleProvider')
  }
  return context
}
