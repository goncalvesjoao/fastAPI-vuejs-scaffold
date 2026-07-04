import { watch } from 'vue'
import { createI18n } from 'vue-i18n'

import en from '@/locales/en'
import ja from '@/locales/ja'

export type AppLocale = 'en' | 'ja'

export const APP_LOCALES: AppLocale[] = ['en', 'ja']
const DEFAULT_LOCALE: AppLocale = 'en'
const STORAGE_KEY = 'locale'

function matchLocale(locale: string | null | undefined): AppLocale | undefined {
  const normalizedLocale = locale?.trim().replace('_', '-').toLowerCase()
  const baseLocale = normalizedLocale?.split('-')[0]

  return APP_LOCALES.find((supportedLocale) => supportedLocale === baseLocale)
}

function initialLocale(): AppLocale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE

  const storedLocale = matchLocale(window.localStorage.getItem(STORAGE_KEY))
  if (storedLocale) return storedLocale

  for (const browserLocale of window.navigator.languages) {
    const locale = matchLocale(browserLocale)
    if (locale) return locale
  }

  return DEFAULT_LOCALE
}

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: { en, ja },
})

export function setLocale(locale: string): void {
  i18n.global.locale.value = matchLocale(locale) ?? DEFAULT_LOCALE
}

export function currentLocale(): AppLocale {
  return i18n.global.locale.value as AppLocale
}

export function translate(key: string, parameters?: Record<string, unknown>): string {
  return i18n.global.t(key, parameters ?? {})
}

watch(
  i18n.global.locale,
  (locale) => {
    if (typeof window === 'undefined') return

    window.localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.lang = locale
  },
  { immediate: true, flush: 'sync' },
)
