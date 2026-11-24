import type { Fine, Loan, MeetingRow, Saving } from "@/api/types"
import type { I18nContextValue } from "@/i18n/i18n-context"
import { addDays } from "@/lib/cycle-dates"
import { formatDate, formatMoney, formatMonth } from "@/lib/format"
import { isOverdue } from "@/lib/loan-math"
import { can } from "@/lib/permissions"

type Translate = I18nContextValue["t"]

export type Notice = { id: string; text: string; to: string }

export type NotificationInput = {
  role: string | undefined
  memberId: number | undefined
  today: string
  cycleActive: boolean
  savings: Saving[]
  loans: Loan[]
  fines: Fine[]
  meetings: MeetingRow[]
}

const SOON_DAYS = 7
const MEETING_DAYS = 3

export function buildNotifications(
  input: NotificationInput,
  t: Translate,
  locale: "en" | "rw"
): Notice[] {
  const { role, memberId, today } = input
  const money = (amount: number) => formatMoney(amount, locale)
  const date = (day: string) => formatDate(day, locale)
  const notices: Notice[] = []
  const add = (id: string, text: string, to: string) =>
    notices.push({ id, text, to })

  const mine = input.loans.filter((loan) => loan.member_id === memberId)
  const myFines = input.fines.filter(
    (fine) => fine.member_id === memberId && !fine.is_paid
  )
  const thisMonth = today.slice(0, 7)
  const saidThisMonth = input.savings.some(
    (item) =>
      item.member_id === memberId &&
      item.status !== "reversed" &&
      item.save_date.startsWith(thisMonth)
  )

  if (input.cycleActive && memberId && !saidThisMonth) {
    add(
      "no-saving",
      t("notif.noSaving", { month: formatMonth(`${thisMonth}-01`, locale) }),
      "/savings"
    )
  }
  for (const loan of mine) {
    const to = `/loans/${loan.loan_id}`
    if (isOverdue(loan, today)) {
      add(
        `loan-overdue-${loan.loan_id}`,
        t("notif.loanOverdue", {
          amount: money(loan.remaining_balance),
          date: date(loan.due_date),
        }),
        to
      )
    } else if (
      loan.status === "disbursed" &&
      loan.due_date <= addDays(today, SOON_DAYS)
    ) {
      add(
        `loan-due-${loan.loan_id}`,
        t("notif.loanDue", {
          amount: money(loan.remaining_balance),
          date: date(loan.due_date),
        }),
        to
      )
    } else if (loan.status === "approved") {
      add(
        `loan-approved-${loan.loan_id}`,
        t("notif.loanApproved", { amount: money(loan.principal_amount) }),
        to
      )
    }
  }
  if (myFines.length > 0) {
    add(
      "fines",
      t("notif.finesOwed", {
        amount: money(myFines.reduce((sum, fine) => sum + fine.fine_amount, 0)),
        count: myFines.length,
      }),
      "/fines"
    )
  }
  const soon = input.meetings
    .filter(
      (item) =>
        item.meeting_date >= today &&
        item.meeting_date <= addDays(today, MEETING_DAYS)
    )
    .sort((a, b) => a.meeting_date.localeCompare(b.meeting_date))[0]
  if (soon) {
    add(
      `meeting-${soon.meeting_id}`,
      t("notif.meetingSoon", {
        date: date(soon.meeting_date),
        time: soon.meeting_time,
      }),
      `/meetings/${soon.meeting_id}`
    )
  }

  if (can("viewGroupFigures", role)) {
    const requested = input.loans.filter((loan) => loan.status === "requested")
    const approved = input.loans.filter((loan) => loan.status === "approved")
    const overdue = input.loans.filter((loan) => isOverdue(loan, today))
    const pending = input.savings.filter((item) => item.status === "pending")
    if (can("decideLoan", role) && requested.length > 0) {
      add("decide", t("notif.decide", { count: requested.length }), "/loans")
    }
    if (pending.length > 0) {
      add(
        "verify",
        t(can("verifySavings", role) ? "notif.verify" : "notif.pendingInfo", {
          count: pending.length,
        }),
        "/savings"
      )
    }
    if (can("payLoan", role) && approved.length > 0) {
      add(
        "hand-over",
        t("notif.handOver", { count: approved.length }),
        "/loans"
      )
    }
    if (
      (can("payLoan", role) || can("decideLoan", role)) &&
      overdue.length > 0
    ) {
      add(
        "overdue",
        t("notif.overdueGroup", { count: overdue.length }),
        "/loans"
      )
    }
  }

  if (can("manageMeetings", role)) {
    const latest = input.meetings.find((item) => item.meeting_date <= today)
    if (latest) {
      const to = `/meetings/${latest.meeting_id}`
      if (latest.marked === 0) {
        add(
          "attendance",
          t("notif.attendance", { date: date(latest.meeting_date) }),
          to
        )
      }
      if (!latest.minutes) {
        add(
          "minutes",
          t("notif.minutes", { date: date(latest.meeting_date) }),
          to
        )
      }
    }
  }
  return notices
}
