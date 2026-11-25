import type { Loan } from "@/api/types"

export const RESERVE_PERCENT = 20
export const LOAN_MULTIPLE = 3

export function totalDue(principal: number, rate: number) {
  return Math.round(principal * (1 + rate / 100))
}

export function isOverdue(loan: Loan, today: string) {
  return (
    loan.status === "disbursed" &&
    loan.remaining_balance > 0 &&
    loan.due_date < today
  )
}

export function availableToLend(totalSaved: number, loans: Loan[]) {
  const committed = loans
    .filter((loan) => loan.status === "approved" || loan.status === "disbursed")
    .reduce((sum, loan) => sum + loan.principal_amount, 0)
  const kept = Math.round((totalSaved * (100 - RESERVE_PERCENT)) / 100)
  return Math.max(0, kept - committed)
}

export function lendingSummary(loans: Loan[], today: string) {
  const out = loans.filter((loan) => loan.status === "disbursed")
  return {
    outstanding: out.reduce((sum, loan) => sum + loan.remaining_balance, 0),
    repaid: loans.reduce((sum, loan) => sum + loan.total_paid, 0),
    overdue: out.filter((loan) => isOverdue(loan, today)),
    requested: loans.filter((loan) => loan.status === "requested"),
    approved: loans.filter((loan) => loan.status === "approved"),
  }
}

const DAY = 86_400_000

export function dueDays(loan: Loan, today: string) {
  return Math.round((Date.parse(loan.due_date) - Date.parse(today)) / DAY)
}

export function loanPriority(loan: Loan, today: string) {
  if (isOverdue(loan, today)) {
    return 0
  }
  return { requested: 1, approved: 2, disbursed: 3, closed: 4, rejected: 5 }[
    loan.status
  ]
}
