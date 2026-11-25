import type { ReactElement } from "react"
import { render } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { vi } from "vitest"
import { SessionProvider } from "@/context/session-context"
import { I18nProvider } from "@/i18n/i18n-provider"

export const ROLES = [
  "admin",
  "chairperson",
  "treasurer",
  "secretary",
  "member",
] as const

export function signIn(role: string = "admin", name = "Alice Admin") {
  const payload = btoa(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })
  )
  localStorage.setItem("auth_token", `header.${payload}.signature`)
  localStorage.setItem(
    "auth_session",
    JSON.stringify({
      member_id: 1,
      account_id: 1,
      member_name: name,
      email: "alice@example.com",
      role,
      group_name: "Test Group",
    })
  )
}

export function renderPage(ui: ReactElement, route = "/") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <I18nProvider>
        <SessionProvider>{ui}</SessionProvider>
      </I18nProvider>
    </MemoryRouter>
  )
}

export async function settle<T>(promise: Promise<T>) {
  const guarded = promise.then(
    (value) => ({ ok: true as const, value }),
    (error: unknown) => ({ ok: false as const, error })
  )
  await vi.advanceTimersByTimeAsync(300)
  const result = await guarded
  if (!result.ok) {
    throw result.error
  }
  return result.value
}
