const ALL = ["admin", "chairperson", "treasurer", "secretary", "member"]
const OFFICERS = ["admin", "chairperson", "treasurer", "secretary"]

const allowed = {
  viewGroupFigures: OFFICERS,
  recordSavings: ["admin", "treasurer"],
  verifySavings: ["admin", "chairperson"],
  manageCycles: ["admin"],
  applyLoan: ALL,
  decideLoan: ["admin", "chairperson"],
  payLoan: ["admin", "treasurer"],
  manageMeetings: ["admin", "chairperson", "secretary"],
  issueFine: ["admin", "chairperson", "secretary"],
  markFinePaid: ["admin", "treasurer"],
  previewShareOut: ["admin", "chairperson", "treasurer"],
  executeShareOut: ["admin"],
  viewMembers: OFFICERS,
  addMember: ["admin", "secretary"],
  editMember: ["admin", "secretary"],
  manageMembers: ["admin"],
  editGroup: ["admin"],
  manageInvitations: ["admin", "chairperson", "secretary"],
}

export type Action = keyof typeof allowed

export function can(action: Action, role: string | undefined) {
  return role !== undefined && allowed[action].includes(role)
}
