import { describe, expect, it } from "vitest"
import { can, type Action } from "@/lib/permissions"
import { ROLES } from "@/test/helpers"

// The role table from docs/finish/README.md, written out here on purpose so a
// change to permissions.ts that disagrees with the agreed rules fails.
const ALLOWED: Record<Action, string[]> = {
  viewGroupFigures: ["admin", "chairperson", "treasurer", "secretary"],
  recordSavings: ["admin", "treasurer"],
  verifySavings: ["admin", "chairperson"],
  manageCycles: ["admin"],
  applyLoan: ["admin", "chairperson", "treasurer", "secretary", "member"],
  decideLoan: ["admin", "chairperson"],
  payLoan: ["admin", "treasurer"],
  manageMeetings: ["admin", "chairperson", "secretary"],
  issueFine: ["admin", "chairperson", "secretary"],
  markFinePaid: ["admin", "treasurer"],
  previewShareOut: ["admin", "chairperson", "treasurer"],
  executeShareOut: ["admin"],
  viewMembers: ["admin", "chairperson", "treasurer", "secretary"],
  addMember: ["admin", "secretary"],
  editMember: ["admin", "secretary"],
  manageMembers: ["admin"],
  editGroup: ["admin"],
  manageInvitations: ["admin", "chairperson", "secretary"],
}

const cases = (Object.keys(ALLOWED) as Action[]).flatMap((action) =>
  ROLES.map((role) => [action, role, ALLOWED[action].includes(role)] as const)
)

describe("can()", () => {
  it.each(cases)("%s for %s is %s", (action, role, expected) => {
    expect(can(action, role)).toBe(expected)
  })

  it("refuses everything when nobody is signed in", () => {
    for (const action of Object.keys(ALLOWED) as Action[]) {
      expect(can(action, undefined)).toBe(false)
    }
  })

  it("refuses an unknown role", () => {
    expect(can("viewGroupFigures", "visitor")).toBe(false)
    expect(can("applyLoan", "visitor")).toBe(false)
  })

  it("never lets the treasurer verify their own entries", () => {
    expect(can("recordSavings", "treasurer")).toBe(true)
    expect(can("verifySavings", "treasurer")).toBe(false)
  })

  it("keeps money-handling and fine-issuing with different officers", () => {
    expect(can("payLoan", "secretary")).toBe(false)
    expect(can("issueFine", "treasurer")).toBe(false)
  })
})
