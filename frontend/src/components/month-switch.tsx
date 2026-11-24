import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/i18n-context"
import { formatMonthYear } from "@/lib/format"
import { cn } from "@/lib/utils"

function shift(month: string, step: number) {
  const [year, number] = month.split("-").map(Number)
  return new Date(Date.UTC(year, number - 1 + step, 1))
    .toISOString()
    .slice(0, 10)
}

type MonthSwitchProps = {
  value: string
  first: string
  last: string
  disabled?: boolean
  onChange: (month: string) => void
}

export function MonthSwitch({
  value,
  first,
  last,
  disabled,
  onChange,
}: MonthSwitchProps) {
  const { t, locale } = useI18n()

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 max-sm:w-full max-sm:justify-between">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t("dashboard.prevMonth")}
        disabled={disabled || value.slice(0, 7) <= first.slice(0, 7)}
        onClick={() => onChange(shift(value, -1))}
      >
        <RiArrowLeftSLine aria-hidden="true" />
      </Button>
      <span
        aria-live="polite"
        className="min-w-32 text-center text-sm font-medium"
      >
        {formatMonthYear(value, locale)}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t("dashboard.nextMonth")}
        disabled={disabled || value.slice(0, 7) >= last.slice(0, 7)}
        onClick={() => onChange(shift(value, 1))}
      >
        <RiArrowRightSLine aria-hidden="true" />
      </Button>
    </div>
  )
}

export function AllMonthsButton({
  active,
  onClick,
}: {
  active: boolean
  onClick: () => void
}) {
  const { t } = useI18n()

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "min-h-10 rounded-full border px-4 text-sm font-medium max-md:min-h-11",
        active
          ? "border-brand bg-brand text-brand-foreground"
          : "border-border bg-card hover:bg-muted"
      )}
    >
      {t("savings.allMonths")}
    </button>
  )
}
