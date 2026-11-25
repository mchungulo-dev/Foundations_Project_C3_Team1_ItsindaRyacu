import { useState } from "react"
import { Link } from "react-router-dom"
import type { SavingsOverview } from "@/api/savings"
import type {
  AttendanceSummaryRow,
  Cycle,
  Fine,
  Group,
  Loan,
  MeetingRow,
  MemberOption,
} from "@/api/types"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { useSession } from "@/context/session-context"
import { useI18n } from "@/i18n/i18n-context"
import { formatMoney, formatMonth, getToday } from "@/lib/format"
import { can } from "@/lib/permissions"
import { monthTotal, sortByNewest, totalUpTo } from "@/lib/savings-totals"
import { UnpaidThisMonth } from "@/pages/savings/unpaid-this-month"
import { Attention } from "@/pages/dashboard/attention"
import { DashboardHeader } from "@/pages/dashboard/dashboard-header"
import { LoansSummary } from "@/pages/dashboard/loan-sections"
import { MissedMeetings, NextMeeting } from "@/pages/dashboard/meeting-sections"
import { MonthProgress } from "@/pages/dashboard/month-progress"
import { MonthSwitch } from "@/components/month-switch"
import { RecentSavings } from "@/pages/dashboard/recent-savings"
import { SavingsChart } from "@/pages/dashboard/savings-chart"

type GroupDashboardProps = {
  group: Group
  cycle: Cycle
  overview: SavingsOverview
  members: MemberOption[]
  loans: Loan[]
  meetings: MeetingRow[]
  fines: Fine[]
  missed: AttendanceSummaryRow[]
}

export function GroupDashboard({
  group,
  cycle,
  overview,
  members,
  loans,
  meetings,
  fines,
  missed,
}: GroupDashboardProps) {
  const { session } = useSession()
  const { t, locale } = useI18n()
  const role = session?.user.role
  const money = (amount: number) => formatMoney(amount, locale)
  const thisMonth = `${getToday().slice(0, 7)}-01`
  const [month, setMonth] = useState(thisMonth)
  const isCurrent = month === thisMonth
  const monthName = formatMonth(month, locale)
  const collected = monthTotal(overview.contributions, month)
  const pending = overview.contributions.filter(
    (item) => item.status === "pending"
  ).length
  const verified = sortByNewest(
    overview.contributions.filter((item) => item.status === "verified")
  ).slice(0, 5)

  return (
    <>
      <DashboardHeader>
        {can("recordSavings", role) ? (
          <Button
            className="max-sm:flex-1"
            render={<Link to="/savings/record" />}
            nativeButton={false}
          >
            {t("savings.record")}
          </Button>
        ) : null}
        {can("manageMeetings", role) ? (
          <Button
            variant="outline"
            className="max-sm:flex-1"
            render={<Link to="/meetings" />}
            nativeButton={false}
          >
            {t("dashboard.planMeeting")}
          </Button>
        ) : null}
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
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
        <StatCard
          highlight
          className="col-span-2 xl:col-span-1"
          label={t("dashboard.groupSaved")}
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
        <MonthProgress
          label={
            isCurrent
              ? t("dashboard.monthlyContribution")
              : t("dashboard.collectedIn", { month: monthName })
          }
          collected={collected}
          target={overview.monthly_target}
          month={month}
        />
        <StatCard
          label={t("dashboard.pending")}
          value={String(pending)}
          note={t("dashboard.pendingNote")}
          action={
            can("verifySavings", role) && pending > 0
              ? { to: "/savings", label: t("dashboard.verifyNow") }
              : undefined
          }
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <SavingsChart
          savings={overview.contributions}
          title={t("dashboard.savingsHistory")}
          month={month}
        />
        <UnpaidThisMonth
          members={members}
          savings={overview.contributions}
          amount={cycle.contribution_amount}
          month={month}
          limit={5}
        />
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <NextMeeting meetings={meetings} />
          {missed.length > 0 ? <MissedMeetings rows={missed} /> : null}
        </div>
        <LoansSummary loans={loans} saved={overview.total_savings} />
      </div>
      <RecentSavings
        title={t("dashboard.recentGroup")}
        rows={verified}
        showMember
        emptyText={t("dashboard.emptyGroup")}
      />
    </>
  )
}
