import { LOCALES, useI18n } from "@/i18n/i18n-context"
import { cn } from "@/lib/utils"

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n()

  return (
    <div
      role="group"
      aria-label={t("language.label")}
      className={cn("flex rounded-lg bg-secondary p-1 text-xs", className)}
    >
      {LOCALES.map((option) => {
        const selected = option.code === locale
        return (
          <button
            key={option.code}
            type="button"
            lang={option.code}
            aria-pressed={selected}
            onClick={() => setLocale(option.code)}
            className={cn(
              "rounded-md px-3 py-1.5 focus-visible:outline-2 focus-visible:outline-primary",
              selected
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
