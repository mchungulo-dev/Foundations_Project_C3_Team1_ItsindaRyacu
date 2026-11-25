import { Link } from "react-router-dom"
import type { Fine } from "@/api/types"
import { RemindLinks } from "@/components/remind-links"
import { StatusBadge } from "@/components/status-badge"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useI18n } from "@/i18n/i18n-context"
import { formatDate, formatMoney } from "@/lib/format"
import { MarkPaid } from "@/pages/fines/mark-paid"

export function FineTable({
  fines,
  onChanged,
}: {
  fines: Fine[]
  onChanged: () => void
}) {
  const { t, locale } = useI18n()

  return (
    <Card className="hidden py-0 xl:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">{t("fines.colIssued")}</TableHead>
            <TableHead scope="col">{t("fines.member")}</TableHead>
            <TableHead scope="col">{t("fines.colReason")}</TableHead>
            <TableHead scope="col" className="text-right">
              {t("savings.colAmount")}
            </TableHead>
            <TableHead scope="col">{t("savings.colStatus")}</TableHead>
            <TableHead scope="col">
              <span className="sr-only">{t("savings.colActions")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fines.map((fine) => {
            const money = formatMoney(fine.fine_amount, locale)
            return (
              <TableRow key={fine.fine_id}>
                <TableCell>
                  {formatDate(fine.created_at.slice(0, 10), locale)}
                </TableCell>
                <TableCell className="font-medium">
                  {fine.member_name}
                </TableCell>
                <TableCell className="max-w-xs whitespace-normal">
                  <p>{fine.reason}</p>
                  {fine.meeting_id ? (
                    <Link
                      to={`/meetings/${fine.meeting_id}`}
                      className="text-sm text-brand hover:underline hover:underline-offset-4"
                    >
                      {t("fines.forMeeting")}
                    </Link>
                  ) : null}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {money}
                </TableCell>
                <TableCell>
                  <StatusBadge tone={fine.is_paid ? "good" : "warn"}>
                    {t(
                      fine.is_paid ? "fines.statusPaid" : "fines.statusUnpaid"
                    )}
                  </StatusBadge>
                  {fine.is_paid && fine.paid_on ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(fine.paid_on, locale)}
                    </p>
                  ) : null}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-end gap-2">
                    <MarkPaid fine={fine} onChanged={onChanged} />
                    {!fine.is_paid ? (
                      <RemindLinks
                        memberId={fine.member_id}
                        name={fine.member_name}
                        kind="reminder.fine"
                        params={{ amount: money, reason: fine.reason }}
                      />
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
