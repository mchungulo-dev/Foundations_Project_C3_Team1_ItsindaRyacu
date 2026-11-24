import { beforeEach, describe, expect, it, vi } from "vitest"
import { closeCycle, createCycle, getActiveCycle } from "@/api/cycles"
import {
  addRepayment,
  decideLoan,
  disburseLoan,
  getLoan,
  getLoans,
} from "@/api/loans"
import {
  addSaving,
  getSavings,
  reverseSaving,
  verifySaving,
} from "@/api/savings"
import { getToday } from "@/lib/format"
import { settle, signIn } from "@/test/helpers"

// The demo data answers after a short delay, so these tests run on fake timers.
beforeEach(() => {
  vi.useFakeTimers()
  signIn("admin")
})

async function activeCycleId() {
  const cycle = await settle(getActiveCycle())
  expect(cycle).not.toBeNull()
  return cycle!.cycle_id
}

async function newSaving(patch: Partial<Parameters<typeof addSaving>[0]> = {}) {
  return {
    cycle_id: await activeCycleId(),
    member_id: 1,
    amount: 20000,
    save_date: getToday(),
    client_ref: "ref-1",
    ...patch,
  }
}

describe("recording a saving", () => {
  it("saves it as pending until someone verifies it", async () => {
    const result = await settle(addSaving(await newSaving()))
    expect(result.message).toBe("Saving recorded successfully")
    expect(result.status).toBe("pending")
  })

  it("answers a retry with the same details without saving it twice", async () => {
    const input = await newSaving({ client_ref: "retry-me" })
    const first = await settle(addSaving(input))
    const again = await settle(addSaving(input))
    expect(again.message).toBe("Saving already recorded")
    expect(again.saving_id).toBe(first.saving_id)

    const all = await settle(getSavings())
    const copies = all.contributions.filter(
      (item) => item.client_ref === "retry-me"
    )
    expect(copies).toHaveLength(1)
  })

  it("treats a repeated reference as already recorded, whatever the details", async () => {
    await settle(addSaving(await newSaving({ client_ref: "taken" })))
    const other = await settle(
      addSaving(await newSaving({ client_ref: "taken", amount: 5000 }))
    )
    expect(other.message).toBe("Saving already recorded")
  })

  it.each([0, -5000, 1500.5, Number.NaN])(
    "refuses an amount of %s",
    async (amount) => {
      await expect(
        settle(addSaving(await newSaving({ amount })))
      ).rejects.toMatchObject({ status: 400 })
    }
  )

  it("refuses a date in the future", async () => {
    await expect(
      settle(addSaving(await newSaving({ save_date: "2099-01-01" })))
    ).rejects.toMatchObject({ status: 400 })
  })

  it("refuses a date from before the cycle began", async () => {
    await expect(
      settle(addSaving(await newSaving({ save_date: "2000-01-01" })))
    ).rejects.toMatchObject({ status: 400 })
  })

  it("refuses an inactive member", async () => {
    await expect(
      settle(addSaving(await newSaving({ member_id: 14 })))
    ).rejects.toMatchObject({ status: 400 })
  })

  it("refuses a member that does not exist", async () => {
    await expect(
      settle(addSaving(await newSaving({ member_id: 9999 })))
    ).rejects.toMatchObject({ status: 404 })
  })

  it.each(["chairperson", "secretary", "member"])(
    "refuses a %s, who does not handle savings money",
    async (role) => {
      const input = await newSaving()
      signIn(role)
      await expect(settle(addSaving(input))).rejects.toMatchObject({
        status: 403,
      })
    }
  )
})

describe("verifying and reversing a saving", () => {
  async function pendingSaving() {
    const added = await settle(addSaving(await newSaving()))
    return added.saving_id
  }

  it("counts a saving in the totals only once it is verified", async () => {
    const before = (await settle(getSavings())).total_savings
    const id = await pendingSaving()
    expect((await settle(getSavings())).total_savings).toBe(before)

    await settle(verifySaving(id))
    expect((await settle(getSavings())).total_savings).toBe(before + 20000)
  })

  it("takes a reversed saving out of the totals again", async () => {
    const before = (await settle(getSavings())).total_savings
    const id = await pendingSaving()
    await settle(verifySaving(id))
    await settle(reverseSaving(id, "Entered for the wrong member"))
    expect((await settle(getSavings())).total_savings).toBe(before)
  })

  it("will not verify a reversed saving", async () => {
    const id = await pendingSaving()
    await settle(reverseSaving(id, "Duplicate"))
    await expect(settle(verifySaving(id))).rejects.toMatchObject({
      status: 409,
    })
  })

  it("needs a reason to reverse", async () => {
    const id = await pendingSaving()
    await expect(settle(reverseSaving(id, "   "))).rejects.toMatchObject({
      status: 400,
    })
  })

  it("does not let the treasurer verify", async () => {
    const id = await pendingSaving()
    signIn("treasurer")
    await expect(settle(verifySaving(id))).rejects.toMatchObject({
      status: 403,
    })
  })
})

// The sample cycle has loans that were paid out. A cycle cannot be closed
// while they are open, so settle them first when a test needs to close it.
async function repayAllLoans() {
  for (const loan of await settle(getLoans())) {
    if (loan.status === "disbursed") {
      await settle(addRepayment(loan.loan_id, loan.remaining_balance))
    }
  }
}

describe("cycles", () => {
  const input = {
    start_date: "2027-01-01",
    end_date: "2027-12-31",
    contribution_amount: 20000,
    default_interest_rate: 5,
  }

  it("allows only one active cycle", async () => {
    await expect(settle(createCycle(input))).rejects.toMatchObject({
      status: 400,
    })
  })

  it("will not close while a loan is still paid out", async () => {
    await expect(
      settle(closeCycle(await activeCycleId()))
    ).rejects.toMatchObject({
      status: 400,
      message: "Cycle contains active loans. Cycle cannot be closed",
    })
  })

  it("allows a new cycle once the active one is closed", async () => {
    await repayAllLoans()
    await settle(closeCycle(await activeCycleId()))
    expect(await settle(getActiveCycle())).toBeNull()

    const created = await settle(createCycle(input))
    expect(created.message).toBe("Cycle created successfully")
    expect((await settle(getActiveCycle()))?.cycle_id).toBe(created.cycle_id)
  })

  it("cannot close the same cycle twice", async () => {
    const id = await activeCycleId()
    await repayAllLoans()
    await settle(closeCycle(id))
    await expect(settle(closeCycle(id))).rejects.toMatchObject({ status: 400 })
  })

  it.each([
    ["an end date before the start", { end_date: "2026-12-31" }],
    ["an end date the same as the start", { end_date: "2027-01-01" }],
    ["a zero contribution", { contribution_amount: 0 }],
    ["a negative interest rate", { default_interest_rate: -1 }],
  ])("refuses %s", async (_label, patch) => {
    await repayAllLoans()
    await settle(closeCycle(await activeCycleId()))
    await expect(
      settle(createCycle({ ...input, ...patch }))
    ).rejects.toMatchObject({ status: 400 })
  })

  it("is for the admin only", async () => {
    signIn("chairperson")
    await expect(settle(closeCycle(1))).rejects.toMatchObject({ status: 403 })
    await expect(settle(createCycle(input))).rejects.toMatchObject({
      status: 403,
    })
  })
})

describe("loans", () => {
  async function loanWithStatus(status: string) {
    const loans = await settle(getLoans())
    const found = loans.find((item) => item.status === status)
    expect(found, `a ${status} loan in the sample data`).toBeDefined()
    return found!
  }

  it("lets the chairperson approve a request once", async () => {
    signIn("chairperson")
    const loan = await loanWithStatus("requested")
    const result = await settle(decideLoan(loan.loan_id, "approved"))
    expect(result.status).toBe("approved")
    await expect(
      settle(decideLoan(loan.loan_id, "rejected"))
    ).rejects.toMatchObject({ status: 409 })
  })

  it("does not let the treasurer decide a request", async () => {
    const loan = await loanWithStatus("requested")
    signIn("treasurer")
    await expect(
      settle(decideLoan(loan.loan_id, "approved"))
    ).rejects.toMatchObject({ status: 403 })
  })

  it("pays out only an approved loan, and only by the treasurer or admin", async () => {
    const requested = await loanWithStatus("requested")
    const approved = await loanWithStatus("approved")

    await expect(
      settle(disburseLoan(requested.loan_id))
    ).rejects.toMatchObject({ status: 409 })

    signIn("chairperson")
    await expect(
      settle(disburseLoan(approved.loan_id))
    ).rejects.toMatchObject({ status: 403 })

    signIn("treasurer")
    await settle(disburseLoan(approved.loan_id))
    const after = await settle(getLoan(approved.loan_id))
    expect(after.loan.status).toBe("disbursed")
    expect(after.loan.issue_date).toBe(getToday())
  })

  it("takes a repayment off the balance and keeps the loan open", async () => {
    const loan = await loanWithStatus("disbursed")
    const result = await settle(addRepayment(loan.loan_id, 1000))
    expect(result.remaining_balance).toBe(loan.remaining_balance - 1000)
    expect(result.loan_status).toBe("disbursed")

    const after = await settle(getLoan(loan.loan_id))
    expect(after.loan.total_paid).toBe(loan.total_paid + 1000)
    expect(after.loan.remaining_balance).toBe(loan.remaining_balance - 1000)
  })

  it("closes the loan when the last franc is paid", async () => {
    const loan = await loanWithStatus("disbursed")
    const result = await settle(
      addRepayment(loan.loan_id, loan.remaining_balance)
    )
    expect(result.remaining_balance).toBe(0)
    expect(result.loan_status).toBe("closed")
    expect((await settle(getLoan(loan.loan_id))).loan.status).toBe("closed")
  })

  it("refuses to take more than is owed", async () => {
    const loan = await loanWithStatus("disbursed")
    await expect(
      settle(addRepayment(loan.loan_id, loan.remaining_balance + 1))
    ).rejects.toMatchObject({ status: 400 })
  })

  it.each([0, -1000, 250.5])("refuses a repayment of %s", async (amount) => {
    const loan = await loanWithStatus("disbursed")
    await expect(
      settle(addRepayment(loan.loan_id, amount))
    ).rejects.toMatchObject({ status: 400 })
  })

  it("takes repayments only on a loan that has been paid out", async () => {
    const approved = await loanWithStatus("approved")
    await expect(
      settle(addRepayment(approved.loan_id, 1000))
    ).rejects.toMatchObject({ status: 409 })
  })

  it("shows a member only their own loans", async () => {
    signIn("member", "Aline Nyiraneza") // member_id 1 in the helper
    const mine = await settle(getLoans())
    expect(mine.length).toBeGreaterThan(0)
    expect(mine.every((item) => item.member_id === 1)).toBe(true)
  })
})
