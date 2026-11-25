import { Link } from "react-router-dom"
import type { Fine } from "@/api/types"
import { RemindLinks } from "@/components/remind-links"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/i18n/i18n-context"
import { formatDate, formatMoney } from "@/lib/format"
import { MarkPaid } from "@/pages/fines/mark-paid"

type FineCardProps = {
  fine: Fine
  showMember: boolean
  onChanged: () => void
}

export function FineCard({ fine, showMember, onChanged }: FineCardProps) {
  const { t, locale } = useI18n()
  const money = formatMoney(fine.fine_amount, locale)

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold">
              {showMember ? fine.member_name : money}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {showMember ? `${money} · ` : ""}
              {fine.reason}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {fine.is_paid && fine.paid_on
                ? t("fines.paidOn", { date: formatDate(fine.paid_on, locale) })
                : t("fines.issuedOn", {
                    date: formatDate(fine.created_at.slice(0, 10), locale),
                  })}
            </p>
          </div>
          <StatusBadge tone={fine.is_paid ? "good" : "warn"}>
            {t(fine.is_paid ? "fines.statusPaid" : "fines.statusUnpaid")}
          </StatusBadge>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <MarkPaid fine={fine} onChanged={onChanged} />
          {fine.meeting_id ? (
            <Link
              to={`/meetings/${fine.meeting_id}`}
              className="inline-flex min-h-11 items-center text-sm font-medium text-brand hover:underline hover:underline-offset-4"
            >
              {t("fines.forMeeting")}
            </Link>
          ) : null}
        </div>
        {showMember && !fine.is_paid ? (
          <RemindLinks
            memberId={fine.member_id}
            name={fine.member_name}
            kind="reminder.fine"
            params={{ amount: money, reason: fine.reason }}
          />
        ) : null}
      </CardContent>
    </Card>
  )
}
