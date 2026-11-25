import type {
  AttendanceSummaryRow,
  Cycle,
  Fine,
  Loan,
  MemberOption,
  RepaymentRow,
  Saving,
} from "@/api/types"
import type { I18nContextValue } from "@/i18n/i18n-context"
import { formatMonthYear } from "@/lib/format"
import { percentOf, totalOf } from "@/lib/savings-totals"
import { LOAN_STATUS } from "@/pages/loans/loan-status"

type Translate = I18nContextValue["t"]

export type ReportKey =
  "byMember" | "overTime" | "loans" | "repayments" | "fines" | "attendance"

export const REPORT_KEYS: ReportKey[] = [
  "byMember",
  "overTime",
  "loans",
  "repayments",
  "fines",
  "attendance",
]

export type Cell = string | number
export type Column = {
  label: string
  kind?: "money" | "date" | "number"
}
export type ReportData = {
  columns: Column[]
  rows: Cell[][]
  footer?: Cell[]
}

export type ReportInput = {
  cycle: Cycle
  savings: Saving[]
  members: MemberOption[]
  loans: Loan[]
  repayments: RepaymentRow[]
  fines: Fine[]
  attendance: AttendanceSummaryRow[]
}

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0)

export function buildReport(
  key: ReportKey,
  input: ReportInput,
  t: Translate,
  locale: "en" | "rw"
): ReportData {
  const { cycle } = input
  const loans = input.loans.filter((item) => item.cycle_id === cycle.cycle_id)
  const loanIds = loans.map((item) => item.loan_id)
  const savings = input.savings.filter(
    (item) => item.cycle_id === cycle.cycle_id
  )

  if (key === "byMember") {
    const total = totalOf(savings)
    const rows = input.members
      .map((member) => ({
        name: member.member_name,
        saved: totalOf(savings.filter((s) => s.member_id === member.member_id)),
      }))
      .filter((row) => row.saved > 0)
      .sort((a, b) => b.saved - a.saved)
      .map((row) => [row.name, row.saved, percentOf(row.saved, total)])
    return {
      columns: [
        { label: t("reports.member") },
        { label: t("reports.saved"), kind: "money" },
        { label: t("reports.share"), kind: "number" },
      ],
      rows,
      footer: rows.length > 0 ? [t("reports.total"), total, 100] : undefined,
    }
  }

  if (key === "overTime") {
    const months = [
      ...new Set(
        savings
          .filter((item) => item.status === "verified")
          .map((item) => item.save_date.slice(0, 7))
      ),
    ].sort()
    let running = 0
    const rows = months.map((month) => {
      const amount = totalOf(
        savings.filter((item) => item.save_date.startsWith(month))
      )
      running += amount
      return [formatMonthYear(`${month}-01`, locale), amount, running]
    })
    return {
      columns: [
        { label: t("reports.month") },
        { label: t("reports.saved"), kind: "money" },
        { label: t("reports.running"), kind: "money" },
      ],
      rows,
    }
  }

  if (key === "loans") {
    const out = loans.filter(
      (item) => item.status === "disbursed" || item.status === "closed"
    )
    const rows = loans.map((item) => [
      item.member_name,
      item.principal_amount,
      item.interest_rate,
      item.total_due,
      item.total_paid,
      item.remaining_balance,
      item.due_date,
      t(LOAN_STATUS[item.status].label),
    ])
    return {
      columns: [
        { label: t("reports.member") },
        { label: t("loans.principal"), kind: "money" },
        { label: t("reports.rate"), kind: "number" },
        { label: t("loans.total"), kind: "money" },
        { label: t("loans.repaid"), kind: "money" },
        { label: t("loans.remaining"), kind: "money" },
        { label: t("reports.due"), kind: "date" },
        { label: t("reports.status") },
      ],
      rows,
      footer:
        out.length > 0
          ? [
              t("reports.totalPaidOut"),
              sum(out.map((i) => i.principal_amount)),
              "",
              sum(out.map((i) => i.total_due)),
              sum(out.map((i) => i.total_paid)),
              sum(out.map((i) => i.remaining_balance)),
              "",
              "",
            ]
          : undefined,
    }
  }

  if (key === "repayments") {
    const rows = input.repayments
      .filter((item) => loanIds.includes(item.loan_id))
      .map((item) => [
        item.payment_date,
        item.member_name,
        item.loan_id,
        item.amount_repaid,
      ])
    return {
      columns: [
        { label: t("reports.date"), kind: "date" },
        { label: t("reports.member") },
        { label: t("reports.loan"), kind: "number" },
        { label: t("reports.amount"), kind: "money" },
      ],
      rows,
      footer:
        rows.length > 0
          ? [t("reports.total"), "", "", sum(rows.map((row) => Number(row[3])))]
          : undefined,
    }
  }

  if (key === "fines") {
    const inCycle = input.fines.filter((item) => {
      const day = item.created_at.slice(0, 10)
      return day >= cycle.start_date && day <= cycle.end_date
    })
    const rows = inCycle.map((item) => [
      item.created_at.slice(0, 10),
      item.member_name,
      item.reason,
      item.fine_amount,
      t(item.is_paid ? "fines.statusPaid" : "fines.statusUnpaid"),
      item.paid_on ?? "",
    ])
    return {
      columns: [
        { label: t("reports.date"), kind: "date" },
        { label: t("reports.member") },
        { label: t("fines.reason") },
        { label: t("reports.amount"), kind: "money" },
        { label: t("reports.status") },
        { label: t("reports.paidOn"), kind: "date" },
      ],
      rows,
      footer:
        rows.length > 0
          ? [
              t("reports.total"),
              "",
              "",
              sum(inCycle.map((item) => item.fine_amount)),
              "",
              "",
            ]
          : undefined,
    }
  }

  return {
    columns: [
      { label: t("reports.member") },
      { label: t("meetings.statusPresent"), kind: "number" },
      { label: t("meetings.statusLate"), kind: "number" },
      { label: t("meetings.statusAbsent"), kind: "number" },
      { label: t("meetings.statusExcused"), kind: "number" },
    ],
    rows: input.attendance.map((item) => [
      item.member_name,
      item.present,
      item.late,
      item.absent,
      item.excused,
    ]),
  }
}
