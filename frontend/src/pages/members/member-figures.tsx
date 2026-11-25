import { useCallback } from "react"
import { getActiveCycle } from "@/api/cycles"
import { getFines } from "@/api/fines"
import { getLoans } from "@/api/loans"
import { getAttendanceSummary } from "@/api/meetings"
import { getSavings } from "@/api/savings"
import { StatCard } from "@/components/stat-card"
import { useRequest } from "@/hooks/use-request"
import { useI18n } from "@/i18n/i18n-context"
import { formatMoney, getToday } from "@/lib/format"
import { monthTotal, percentOf, totalOf } from "@/lib/savings-totals"
import { LOAN_STATUS } from "@/pages/loans/loan-status"

export function MemberFigures({ memberId }: { memberId: number }) {
  const { t, locale } = useI18n()
  const money = (amount: number) => formatMoney(amount, locale)
  const load = useCallback(async () => {
    const [cycle, loans, fines, attendance] = await Promise.all([
      getActiveCycle(),
      getLoans(),
      getFines(),
      getAttendanceSummary(),
    ])
    const overview = cycle ? await getSavings(cycle.cycle_id) : null
    return {
      savings: (overview?.contributions ?? []).filter(
        (item) => item.member_id === memberId
      ),
      loans: loans.filter((item) => item.member_id === memberId),
      fines: fines.filter(
        (item) => item.member_id === memberId && !item.is_paid
      ),
      attendance: attendance.find((item) => item.member_id === memberId),
    }
  }, [memberId])
  const { data } = useRequest(load)

  if (!data) {
    return null
  }
  const { savings, loans, fines, attendance } = data
  const loan =
    loans.find((item) => item.status === "disbursed") ??
    loans.find(
      (item) => item.status === "approved" || item.status === "requested"
    )
  const held = attendance
    ? attendance.present +
      attendance.late +
      attendance.absent +
      attendance.excused
    : 0
  const came = attendance ? attendance.present + attendance.late : 0

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      <StatCard
        highlight
        label={t("members.figSaved")}
        value={money(totalOf(savings))}
        note={t("dashboard.thisMonth", {
          amount: money(monthTotal(savings, getToday())),
        })}
        action={{
          to: `/statements?member=${memberId}`,
          label: t("statements.view"),
        }}
      />
      <StatCard
        label={t("members.figLoan")}
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
          loan ? t(LOAN_STATUS[loan.status].label) : t("dashboard.loanNone")
        }
        action={
          loan
            ? { to: `/loans/${loan.loan_id}`, label: t("loans.details") }
            : undefined
        }
      />
      <StatCard
        label={t("fines.unpaidTotal")}
        value={money(fines.reduce((sum, fine) => sum + fine.fine_amount, 0))}
        note={t("fines.unpaidCount", { count: fines.length })}
        action={
          fines.length > 0
            ? { to: "/fines", label: t("fines.title") }
            : undefined
        }
      />
      <StatCard
        label={t("meetings.colAttendance")}
        value={held > 0 ? `${percentOf(came, held)}%` : "–"}
        note={t("meetings.myRateNote", { attended: came, total: held })}
      />
    </div>
  )
}
