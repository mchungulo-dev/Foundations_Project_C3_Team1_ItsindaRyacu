import type { ShareOutRow } from "@/api/types"
import { useI18n } from "@/i18n/i18n-context"
import { formatMoney } from "@/lib/format"

export function Breakdown({ row }: { row: ShareOutRow }) {
  const { t, locale } = useI18n()
  const money = (amount: number) => formatMoney(amount, locale)
  const lines: [string, string][] = [
    [t("shareOut.saved"), money(row.savings)],
    [t("shareOut.share"), `+ ${money(row.share)}`],
    [t("shareOut.fines"), `− ${money(row.fines)}`],
    [t("shareOut.loans"), `− ${money(row.loans)}`],
  ]

  return (
    <div className="space-y-2 text-sm">
      {lines.map(([label, value]) => (
        <p key={label} className="flex justify-between gap-3">
          <span className="text-muted-foreground">{label}</span>
          <span>{value}</span>
        </p>
      ))}
      <p className="flex justify-between gap-3 border-t border-border pt-2 font-semibold">
        <span>{t("shareOut.payout")}</span>
        <span>{money(row.payout)}</span>
      </p>
      {row.owes > 0 ? (
        <p role="status" className="text-destructive">
          {t("shareOut.owes", { amount: money(row.owes) })}
        </p>
      ) : null}
    </div>
  )
}
