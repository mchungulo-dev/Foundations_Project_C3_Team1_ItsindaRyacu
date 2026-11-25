import { useState } from "react"
import { Link } from "react-router-dom"
import { RiTimeLine } from "@remixicon/react"
import type { SavingsOverview } from "@/api/savings"
import type { Cycle, Fine, Group, Loan, MeetingRow } from "@/api/types"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/i18n/i18n-context"
import { formatDate, formatMoney, formatMonth, getToday } from "@/lib/format"
import { monthTotal, totalUpTo } from "@/lib/savings-totals"
import { Attention } from "@/pages/dashboard/attention"
import { DashboardHeader } from "@/pages/dashboard/dashboard-header"
import { NextMeeting } from "@/pages/dashboard/meeting-sections"
import { MonthProgress } from "@/pages/dashboard/month-progress"
import { MonthSwitch } from "@/components/month-switch"
import { RecentSavings } from "@/pages/dashboard/recent-savings"
import { SavingsChart } from "@/pages/dashboard/savings-chart"

type MemberDashboardProps = {
  group: Group
  cycle: Cycle
  overview: SavingsOverview
  loans: Loan[]
  meetings: MeetingRow[]
  fines: Fine[]
}

export function MemberDashboard({
  group,
  cycle,
  overview,
  loans,
  meetings,
  fines,
}: MemberDashboardProps) {
  const { t, locale } = useI18n()
  const money = (amount: number) => formatMoney(amount, locale)
  const thisMonth = `${getToday().slice(0, 7)}-01`
  const [month, setMonth] = useState(thisMonth)
  const isCurrent = month === thisMonth
  const monthName = formatMonth(month, locale)
  const collected = monthTotal(overview.contributions, month)
  const remaining = Math.max(0, overview.monthly_target - collected)
  const loan =
    loans.find((item) => item.status === "disbursed") ??
    loans.find(
      (item) => item.status === "approved" || item.status === "requested"
    )

  return (
    <>
      <DashboardHeader>
        <MonthSwitch
          value={month}
          first={cycle.start_date}
          last={thisMonth}
          onChange={setMonth}
        />
      </DashboardHeader>
      <Attention
        group={group}
        loans={loans}
        meetings={meetings}
        fines={fines}
      />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          highlight
          label={t("dashboard.yourTotal")}
          value={money(totalUpTo(overview.contributions, month))}
          note={
            isCurrent
              ? t("dashboard.thisMonth", { amount: money(collected) })
              : t("dashboard.inMonth", {
                  amount: money(collected),
                  month: monthName,
                })
          }
          action={{ to: "/savings", label: t("dashboard.viewSavings") }}
        />
        <StatCard
          label={t(loan ? "dashboard.loanTitle" : "dashboard.loanNone")}
          value={
            loan
              ? money(
                  loan.status === "disbursed"
                    ? loan.remaining_balance
                    : loan.principal_amount
                )
              : money(0)
          }
          note={
            loan
              ? t("loans.due", { date: formatDate(loan.due_date, locale) })
              : t("dashboard.loanNoneNote")
          }
          action={{
            to: loan ? `/loans/${loan.loan_id}` : "/loans",
            label: t(loan ? "loans.details" : "loans.apply"),
          }}
        />
        <StatCard
          label={t("dashboard.groupTotal")}
          value={money(group.total_savings)}
          note={t("dashboard.groupTotalNote")}
        />
        <MonthProgress
          label={
            isCurrent
              ? t("dashboard.yourMonth")
              : t("dashboard.yourMonthIn", { month: monthName })
          }
          collected={collected}
          target={overview.monthly_target}
          month={month}
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <SavingsChart
          savings={overview.contributions}
          title={t("dashboard.journey")}
          note={t("dashboard.journeyNote")}
          month={month}
        />
        <Card className="border-0 bg-secondary">
          <CardContent className="flex h-full flex-col justify-center gap-4">
            <RiTimeLine className="size-6 text-brand" aria-hidden="true" />
            <p className="text-sm font-medium text-brand">
              {remaining > 0
                ? t("dashboard.dueEyebrow", { month: monthName.toUpperCase() })
                : t("dashboard.paidTitle", { month: monthName })}
            </p>
            {remaining > 0 ? (
              <h2 className="text-3xl font-semibold tracking-tight">
                {t("dashboard.toGo", { amount: money(remaining) })}
              </h2>
            ) : null}
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t(remaining > 0 ? "dashboard.dueBody" : "dashboard.paidBody")}
            </p>
            <Button
              variant="outline"
              render={<Link to="/savings" />}
              nativeButton={false}
            >
              {t("dashboard.seeSavings")}
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_2fr]">
        <NextMeeting meetings={meetings} />
        <RecentSavings
          title={t("dashboard.recentActivity")}
          rows={overview.contributions.slice(0, 5)}
          showMember={false}
          emptyText={t("dashboard.emptyMine")}
        />
      </div>
    </>
  )
}
