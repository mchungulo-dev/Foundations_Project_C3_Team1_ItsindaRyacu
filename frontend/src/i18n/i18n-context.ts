import { createContext, useContext } from "react"
import type { MessageKey } from "@/i18n/locales/en"

export type Locale = "en" | "rw"

// Each language is always shown in its own name, so these are not translated.
export const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "rw", label: "Kinyarwanda" },
]

export type TranslateParams = Record<string, string | number>

export type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: MessageKey, params?: TranslateParams) => string
}

export const I18nContext = createContext<I18nContextValue | null>(null)

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider")
  }
  return context
}
