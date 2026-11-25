import type { ReactNode } from "react"
import type { ShareOutRow } from "@/api/types"
import { ProgressBar } from "@/components/progress-bar"
import { SectionCard } from "@/components/section-card"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
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
import { percentOf } from "@/lib/savings-totals"
import type { buildStatement } from "@/lib/statement"
import { LOAN_STATUS } from "@/pages/loans/loan-status"
import { SAVING_STATUS } from "@/pages/savings/saving-status"
import { Breakdown } from "@/pages/share-out/breakdown"

type Statement = ReturnType<typeof buildStatement>

function Section({
  title,
  empty,
  flush,
  children,
}: {
  title: string
  empty: boolean
  flush?: boolean
  children: ReactNode
}) {
  const { t } = useI18n()

  return (
    <SectionCard title={title} flush={flush && !empty}>
      {empty ? (
        <p className="text-sm text-muted-foreground">{t("statements.empty")}</p>
      ) : (
        children
      )}
    </SectionCard>
  )
}

export function StatementView({
  statement,
  shareOut,
}: {
  statement: Statement
  shareOut: ShareOutRow | null
}) {
  const { t, locale } = useI18n()
  const money = (amount: number) => formatMoney(amount, locale)
  const { totals } = statement

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          highlight
          label={t("statements.totalSaved")}
          value={money(totals.saved)}
          note={
            totals.pending > 0
              ? `${money(totals.pending)} ${t("statements.pending").toLowerCase()}`
              : undefined
          }
        />
        <StatCard
          label={t("statements.pending")}
          value={money(totals.pending)}
        />
        <StatCard
          label={t("statements.stillToPay")}
          value={money(totals.remaining)}
        />
        <StatCard
          label={t("statements.unpaidFines")}
          value={money(totals.finesUnpaid)}
        />
      </div>
      <Section
        flush
        title={t("statements.savings")}
        empty={statement.savings.length === 0}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">{t("savings.colDate")}</TableHead>
              <TableHead scope="col" className="text-right">
                {t("savings.colAmount")}
              </TableHead>
              <TableHead scope="col">{t("savings.colStatus")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statement.savings.map((saving) => {
              const { label, tone } = SAVING_STATUS[saving.status]
              return (
                <TableRow key={saving.saving_id}>
                  <TableCell>{formatDate(saving.save_date, locale)}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {money(saving.amount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge tone={tone}>{t(label)}</StatusBadge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Section>
      <Section
        title={t("statements.loans")}
        empty={statement.loans.length === 0}
      >
        <ul className="divide-y divide-border">
          {statement.loans.map((loan) => {
            const { label, tone } = LOAN_STATUS[loan.status]
            return (
              <li
                key={loan.loan_id}
                className="space-y-2 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">
                    {t("statements.loanLine", {
                      amount: money(loan.principal_amount),
                      date: formatDate(loan.due_date, locale),
                    })}
                  </span>
                  <StatusBadge tone={tone}>{t(label)}</StatusBadge>
                </div>
                <ProgressBar
                  value={percentOf(loan.total_paid, loan.total_due)}
                  label={t("loans.repaid")}
                />
                <p className="text-sm text-muted-foreground">
                  {t("loans.progress", {
                    paid: money(loan.total_paid),
                    total: money(loan.total_due),
                  })}
                </p>
                {statement.repayments
                  .filter((item) => item.loan_id === loan.loan_id)
                  .map((item) => (
                    <p
                      key={item.repayment_id}
                      className="text-sm text-muted-foreground"
                    >
                      {t("statements.repayment", {
                        amount: money(item.amount_repaid),
                        date: formatDate(item.payment_date, locale),
                      })}
                    </p>
                  ))}
              </li>
            )
          })}
        </ul>
      </Section>
      <Section
        flush
        title={t("statements.fines")}
        empty={statement.fines.length === 0}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">{t("fines.colIssued")}</TableHead>
              <TableHead scope="col">{t("fines.colReason")}</TableHead>
              <TableHead scope="col" className="text-right">
                {t("savings.colAmount")}
              </TableHead>
              <TableHead scope="col">{t("savings.colStatus")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statement.fines.map((fine) => (
              <TableRow key={fine.fine_id}>
                <TableCell>
                  {formatDate(fine.created_at.slice(0, 10), locale)}
                </TableCell>
                <TableCell className="whitespace-normal">
                  {fine.reason}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {money(fine.fine_amount)}
                </TableCell>
                <TableCell>
                  <StatusBadge tone={fine.is_paid ? "good" : "warn"}>
                    {t(
                      fine.is_paid ? "fines.statusPaid" : "fines.statusUnpaid"
                    )}
                  </StatusBadge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>
      {shareOut ? (
        <SectionCard title={t("statements.shareOut")}>
          <Breakdown row={shareOut} />
        </SectionCard>
      ) : null}
    </div>
  )
}
