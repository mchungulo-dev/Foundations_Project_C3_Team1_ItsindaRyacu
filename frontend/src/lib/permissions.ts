export function canRecordContributions(role: string | undefined) {
  return role === "admin" || role === "treasurer"
}

export function canManageMembers(role: string | undefined) {
  return role === "admin"
}
