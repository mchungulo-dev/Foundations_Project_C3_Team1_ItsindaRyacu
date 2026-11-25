import type { Loan } from "@/api/types"
import { Initials, ListRow, RowList } from "@/components/list-row"
import { RemindLinks } from "@/components/remind-links"
import { SectionCard, SectionLink } from "@/components/section-card"
import { cn } from "@/lib/utils"
import { useI18n } from "@/i18n/i18n-context"
import { formatDate, formatMoney, getToday } from "@/lib/format"
import { availableToLend, lendingSummary } from "@/lib/loan-math"

export function LoansSummary({
  loans,
  saved,
}: {
  loans: Loan[]
  saved: number
}) {
  const { t, locale } = useI18n()
  const money = (amount: number) => formatMoney(amount, locale)
  const summary = lendingSummary(loans, getToday())
  const overdue = summary.overdue
  const figures = [
    { label: t("loans.lentOut"), value: money(summary.outstanding) },
    { label: t("loans.paidBack"), value: money(summary.repaid) },
    {
      label: t("loans.available"),
      value: money(availableToLend(saved, loans)),
    },
    {
      label: t("loans.overdueCount"),
      value: String(overdue.length),
      bad: overdue.length > 0,
    },
  ]

  return (
    <SectionCard
      title={t("loans.title")}
      action={<SectionLink to="/loans">{t("dashboard.viewAll")}</SectionLink>}
    >
      <dl className="divide-y divide-border">
        {figures.map((figure) => (
          <div
            key={figure.label}
            className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <dt className="text-sm text-muted-foreground">{figure.label}</dt>
            <dd
              className={cn(
                "font-semibold tabular-nums",
                figure.bad && "text-destructive"
              )}
            >
              {figure.value}
            </dd>
          </div>
        ))}
      </dl>
      {overdue.length > 0 ? (
        <div className="mt-5 rounded-lg bg-destructive/5 p-4">
          <h3 className="mb-3 text-sm font-semibold text-destructive">
            {t("dashboard.overdueTitle")}
          </h3>
          <RowList>
            {overdue.map((loan) => (
              <ListRow
                key={loan.loan_id}
                leading={<Initials name={loan.member_name} />}
                title={loan.member_name}
                to={`/loans/${loan.loan_id}`}
                subtitle={t("dashboard.overdueRow", {
                  amount: money(loan.remaining_balance),
                  date: formatDate(loan.due_date, locale),
                })}
              >
                <RemindLinks
                  memberId={loan.member_id}
                  name={loan.member_name}
                  kind="reminder.loan"
                  params={{
                    amount: money(loan.remaining_balance),
                    date: formatDate(loan.due_date, locale),
                  }}
                />
              </ListRow>
            ))}
          </RowList>
        </div>
      ) : null}
    </SectionCard>
  )
}
