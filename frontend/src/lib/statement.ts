import type { Cycle, Fine, Loan, Repayment, Saving } from "@/api/types"
import { sortByNewest, totalOf } from "@/lib/savings-totals"

type StatementInput = {
  memberId: number
  cycle: Cycle
  savings: Saving[]
  loans: Loan[]
  repayments: Repayment[]
  fines: Fine[]
}

export function buildStatement({
  memberId,
  cycle,
  savings,
  loans,
  repayments,
  fines,
}: StatementInput) {
  const mySavings = sortByNewest(
    savings.filter(
      (item) => item.member_id === memberId && item.cycle_id === cycle.cycle_id
    )
  )
  const myLoans = loans.filter(
    (item) => item.member_id === memberId && item.cycle_id === cycle.cycle_id
  )
  const loanIds = myLoans.map((item) => item.loan_id)
  const myRepayments = repayments.filter((item) =>
    loanIds.includes(item.loan_id)
  )
  const myFines = fines.filter((item) => {
    const day = item.created_at.slice(0, 10)
    return (
      item.member_id === memberId &&
      day >= cycle.start_date &&
      day <= cycle.end_date
    )
  })
  const paidOut = myLoans.filter(
    (item) => item.status === "disbursed" || item.status === "closed"
  )
  const sum = (rows: { fine_amount: number }[]) =>
    rows.reduce((total, row) => total + row.fine_amount, 0)

  return {
    savings: mySavings,
    loans: myLoans,
    repayments: myRepayments,
    fines: myFines,
    totals: {
      saved: totalOf(mySavings),
      pending: mySavings
        .filter((item) => item.status === "pending")
        .reduce((total, item) => total + item.amount, 0),
      borrowed: paidOut.reduce(
        (total, item) => total + item.principal_amount,
        0
      ),
      repaid: paidOut.reduce((total, item) => total + item.total_paid, 0),
      remaining: paidOut.reduce(
        (total, item) => total + item.remaining_balance,
        0
      ),
      finesUnpaid: sum(myFines.filter((item) => !item.is_paid)),
      finesPaid: sum(myFines.filter((item) => item.is_paid)),
    },
  }
}
