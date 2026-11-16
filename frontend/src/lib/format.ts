import type { Locale } from "@/i18n/i18n-context"

// Intl locale used for each app language. "en" keeps the original behavior,
// so callers that pass no locale are unchanged.
const INTL_LOCALE: Record<Locale, { number: string; date: string }> = {
  en: { number: "en-RW", date: "en-GB" },
  rw: { number: "rw-RW", date: "rw-RW" },
}

export function formatMoney(amount: number, locale: Locale = "en") {
  return `RWF ${new Intl.NumberFormat(INTL_LOCALE[locale].number, {
    maximumFractionDigits: 0,
  }).format(amount)}`
}

// Fixtures use YYYY-MM-DD dates. UTC keeps the displayed day consistent.
export function formatDate(date: string, locale: Locale = "en") {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale].date, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date))
}

// Month name for a YYYY-MM-DD date, e.g. "November" / "Ugushyingo".
export function formatMonth(
  date: string,
  locale: Locale = "en",
  style: "long" | "short" = "long"
) {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale].date, {
    month: style,
    timeZone: "UTC",
  }).format(new Date(date))
}

// e.g. "November 2026" / "Ugushyingo 2026".
export function formatMonthYear(date: string, locale: Locale = "en") {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale].date, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date))
}

// Today's date in Rwanda as YYYY-MM-DD, for date inputs and "not in the future" checks.
export function getToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Kigali",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}
