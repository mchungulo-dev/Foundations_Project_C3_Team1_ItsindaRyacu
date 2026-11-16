import type { LoginResponse } from "@/lib/api"

const SESSION_KEY = "auth_session"

export type SessionUser = {
  member_id: number
  account_id: number
  member_name: string
  email: string
  role: string
  group_name: string
}

function isSessionUser(value: unknown): value is SessionUser {
  if (!value || typeof value !== "object") {
    return false
  }
  const o = value as Record<string, unknown>
  return (
    typeof o.member_id === "number" &&
    typeof o.account_id === "number" &&
    typeof o.member_name === "string" &&
    typeof o.email === "string" &&
    typeof o.role === "string" &&
    typeof o.group_name === "string"
  )
}

export function persistSessionUser(user: LoginResponse["user"]): void {
  if (!user) {
    return
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export function readSessionUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) {
      return null
    }
    const parsed: unknown = JSON.parse(raw)
    return isSessionUser(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function clearSessionUser(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function formatRoleLabel(role: string): string {
  if (role === "admin") {
    return "Group admin"
  }
  if (role === "member") {
    return "Group member"
  }
  return role
    ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
    : ""
}

export function firstNameFromFullName(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0]
  return first ?? fullName
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase()
  }
  if (parts.length === 1 && parts[0]!.length >= 2) {
    return parts[0]!.slice(0, 2).toUpperCase()
  }
  return parts[0]?.charAt(0).toUpperCase() ?? "?"
}
