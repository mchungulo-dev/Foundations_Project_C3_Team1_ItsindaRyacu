import { describe, expect, it } from "vitest"
import type { Loan, Saving } from "@/api/types"
import { fileName, toCsv } from "@/lib/csv"
import {
  availableToLend,
  dueDays,
  isOverdue,
  lendingSummary,
  loanPriority,
  totalDue,
} from "@/lib/loan-math"
import {
  monthTotal,
  percentOf,
  sortByNewest,
  totalOf,
  totalUpTo,
} from "@/lib/savings-totals"

let nextId = 1

function loan(patch: Partial<Loan>): Loan {
  return {
    loan_id: nextId++,
    cycle_id: 1,
    member_id: 1,
    principal_amount: 100000,
    interest_rate: 5,
    issue_date: "2026-10-01",
    due_date: "2026-12-01",
    status: "disbursed",
    approved_by: 2,
    created_at: "2026-09-25",
    member_name: "Test",
    total_due: 105000,
    total_paid: 0,
    remaining_balance: 105000,
    ...patch,
  }
}

function saving(patch: Partial<Saving>): Saving {
  return {
    saving_id: nextId++,
    cycle_id: 1,
    member_id: 1,
    member_name: "Test",
    amount: 20000,
    save_date: "2026-11-02",
    status: "verified",
    ...patch,
  }
}

describe("loans", () => {
  it("adds interest to the principal", () => {
    expect(totalDue(100000, 5)).toBe(105000)
    expect(totalDue(80000, 5)).toBe(84000)
    expect(totalDue(50000, 0)).toBe(50000)
    // 33,333 + 5% is 34,999.65, rounded to a whole franc
    expect(totalDue(33333, 5)).toBe(35000)
  })

  it("is overdue only when paid out, still owing and past the due date", () => {
    const today = "2026-12-10"
    expect(isOverdue(loan({ due_date: "2026-12-01" }), today)).toBe(true)
    expect(isOverdue(loan({ due_date: "2026-12-10" }), today)).toBe(false)
    expect(isOverdue(loan({ due_date: "2026-12-20" }), today)).toBe(false)
    expect(isOverdue(loan({ remaining_balance: 0 }), today)).toBe(false)
    expect(isOverdue(loan({ status: "closed" }), today)).toBe(false)
    expect(isOverdue(loan({ status: "requested" }), today)).toBe(false)
  })

  it("counts days to the due date, negative when late", () => {
    expect(dueDays(loan({ due_date: "2026-12-01" }), "2026-11-21")).toBe(10)
    expect(dueDays(loan({ due_date: "2026-12-01" }), "2026-12-04")).toBe(-3)
  })

  it("sorts overdue first, then requests, approved, active, closed, rejected", () => {
    const today = "2026-12-10"
    const order = [
      loan({ status: "disbursed", due_date: "2026-12-01" }),
      loan({ status: "requested" }),
      loan({ status: "approved" }),
      loan({ status: "disbursed", due_date: "2027-01-01" }),
      loan({ status: "closed" }),
      loan({ status: "rejected" }),
    ].map((item) => loanPriority(item, today))
    expect(order).toEqual([0, 1, 2, 3, 4, 5])
  })

  it("keeps 20 percent of savings as a reserve and takes loans already out off", () => {
    expect(availableToLend(1000000, [])).toBe(800000)
    const out = [
      loan({ status: "disbursed", principal_amount: 100000 }),
      loan({ status: "approved", principal_amount: 50000 }),
      loan({ status: "requested", principal_amount: 900000 }),
      loan({ status: "rejected", principal_amount: 900000 }),
      loan({ status: "closed", principal_amount: 900000 }),
    ]
    expect(availableToLend(1000000, out)).toBe(650000)
  })

  it("never offers a negative amount", () => {
    const out = [loan({ status: "disbursed", principal_amount: 500000 })]
    expect(availableToLend(100000, out)).toBe(0)
  })

  it("summarises what is lent, repaid, late and waiting", () => {
    const today = "2026-12-10"
    const summary = lendingSummary(
      [
        loan({ remaining_balance: 65000, total_paid: 40000 }),
        loan({
          remaining_balance: 10000,
          total_paid: 20000,
          due_date: "2027-01-01",
        }),
        loan({ status: "requested", remaining_balance: 0, total_paid: 0 }),
        loan({ status: "approved", remaining_balance: 0, total_paid: 0 }),
        loan({ status: "closed", remaining_balance: 0, total_paid: 105000 }),
      ],
      today
    )
    expect(summary.outstanding).toBe(75000)
    expect(summary.repaid).toBe(165000)
    expect(summary.overdue).toHaveLength(1)
    expect(summary.requested).toHaveLength(1)
    expect(summary.approved).toHaveLength(1)
  })
})

describe("savings totals", () => {
  it("counts only verified savings", () => {
    expect(
      totalOf([
        saving({ amount: 20000 }),
        saving({ amount: 30000, status: "pending" }),
        saving({ amount: 40000, status: "reversed" }),
      ])
    ).toBe(20000)
  })

  it("totals one month, counting verified savings only", () => {
    const rows = [
      saving({ save_date: "2026-11-02", amount: 20000 }),
      saving({ save_date: "2026-11-30", amount: 5000 }),
      saving({ save_date: "2026-10-30", amount: 99000 }),
      saving({ save_date: "2026-11-05", amount: 7000, status: "pending" }),
    ]
    expect(monthTotal(rows, "2026-11-15")).toBe(25000)
  })

  it("adds up everything saved until the end of a month", () => {
    const rows = [
      saving({ save_date: "2026-09-02", amount: 10000 }),
      saving({ save_date: "2026-10-02", amount: 20000 }),
      saving({ save_date: "2026-11-02", amount: 30000 }),
    ]
    expect(totalUpTo(rows, "2026-10-01")).toBe(30000)
    expect(totalUpTo(rows, "2026-11-01")).toBe(60000)
    expect(totalUpTo(rows, "2026-08-01")).toBe(0)
  })

  it("gives a percentage that is capped and safe against a zero target", () => {
    expect(percentOf(150000, 260000)).toBe(58)
    expect(percentOf(300000, 260000)).toBe(100)
    expect(percentOf(5, 0)).toBe(0)
  })

  it("sorts newest first and does not change the original list", () => {
    const rows = [
      saving({ saving_id: 1, save_date: "2026-10-01" }),
      saving({ saving_id: 2, save_date: "2026-11-01" }),
      saving({ saving_id: 3, save_date: "2026-11-01" }),
    ]
    expect(sortByNewest(rows).map((item) => item.saving_id)).toEqual([3, 2, 1])
    expect(rows.map((item) => item.saving_id)).toEqual([1, 2, 3])
  })
})

describe("csv", () => {
  it("quotes commas, quotes and new lines so a spreadsheet reads them right", () => {
    expect(toCsv(["Name", "Note"], [["Aline", 'said "hi", left']])).toBe(
      'Name,Note\r\nAline,"said ""hi"", left"'
    )
    expect(toCsv(["A"], [["line1\nline2"]])).toBe('A\r\n"line1\nline2"')
  })

  it("makes a safe file name", () => {
    expect(fileName("Twitezimbere Group", "By Member", "2026-04-01")).toBe(
      "twitezimbere-group-by-member-2026-04-01.csv"
    )
  })
})
