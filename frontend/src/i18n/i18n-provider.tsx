import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import {
  I18nContext,
  LOCALES,
  type I18nContextValue,
  type Locale,
  type TranslateParams,
} from "@/i18n/i18n-context"
import { en, type MessageKey, type Messages } from "@/i18n/locales/en"
import { rw } from "@/i18n/locales/rw"

const STORAGE_KEY = "app_locale"
const DEFAULT_LOCALE: Locale = "en"

const messages: Record<Locale, Messages> = { en, rw }

function isLocale(value: unknown): value is Locale {
  return LOCALES.some((locale) => locale.code === value)
}

// Storage can throw (private windows, blocked cookies), so never trust it.
function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isLocale(stored) ? stored : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

function interpolate(template: string, params?: TranslateParams): string {
  if (!params) {
    return template
  }
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  )
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // The choice still applies for this visit if it cannot be saved.
    }
  }, [])

  const t = useCallback(
    (key: MessageKey, params?: TranslateParams) =>
      interpolate(messages[locale][key] ?? en[key], params),
    [locale]
  )

  // Keep the page language and tab title in step with the chosen language.
  useEffect(() => {
    document.documentElement.lang = locale
    document.title = t("app.title")
  }, [locale, t])

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
