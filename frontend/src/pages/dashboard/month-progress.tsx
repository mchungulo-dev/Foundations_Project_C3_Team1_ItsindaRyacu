import { ProgressBar } from "@/components/progress-bar"
import { StatCard } from "@/components/stat-card"
import { useI18n } from "@/i18n/i18n-context"
import { formatMoney, formatMonth } from "@/lib/format"
import { percentOf } from "@/lib/savings-totals"

type MonthProgressProps = {
  label: string
  collected: number
  target: number
  month: string
}

export function MonthProgress({
  label,
  collected,
  target,
  month,
}: MonthProgressProps) {
  const { t, locale } = useI18n()
  const percent = percentOf(collected, target)

  return (
    <StatCard
      label={label}
      value={formatMoney(collected, locale)}
      unit={t("dashboard.ofTarget", { amount: formatMoney(target, locale) })}
      note={t("dashboard.goalProgress", {
        percent,
        month: formatMonth(month, locale),
      })}
    >
      <ProgressBar value={percent} label={label} />
    </StatCard>
  )
}
