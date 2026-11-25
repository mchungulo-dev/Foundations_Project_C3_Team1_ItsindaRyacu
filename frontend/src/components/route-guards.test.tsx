import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { describe, expect, it } from "vitest"
import { ProtectedRoute } from "@/components/protected-route"
import { RequireAction } from "@/components/require-action"
import { SessionProvider } from "@/context/session-context"
import { I18nProvider } from "@/i18n/i18n-provider"
import { signIn } from "@/test/helpers"

function LoginStub() {
  const location = useLocation()
  const state = location.state as { from?: string } | null
  return <p>login page, came from {state?.from}</p>
}

function renderAt(route: string, page: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <I18nProvider>
        <SessionProvider>
          <Routes>
            <Route path="/login" element={<LoginStub />} />
            <Route path="/loans" element={page} />
          </Routes>
        </SessionProvider>
      </I18nProvider>
    </MemoryRouter>
  )
}

describe("ProtectedRoute", () => {
  it("sends a signed-out visitor to the login page and remembers where they were going", () => {
    renderAt(
      "/loans",
      <ProtectedRoute>
        <p>secret loans</p>
      </ProtectedRoute>
    )
    expect(screen.queryByText("secret loans")).toBeNull()
    expect(screen.getByText("login page, came from /loans")).toBeTruthy()
  })

  it("shows the page to a signed-in member", () => {
    signIn("member")
    renderAt(
      "/loans",
      <ProtectedRoute>
        <p>secret loans</p>
      </ProtectedRoute>
    )
    expect(screen.getByText("secret loans")).toBeTruthy()
  })

  it("treats an expired token as signed out", () => {
    signIn("admin")
    const expired = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 60 }))
    localStorage.setItem("auth_token", `header.${expired}.signature`)
    renderAt(
      "/loans",
      <ProtectedRoute>
        <p>secret loans</p>
      </ProtectedRoute>
    )
    expect(screen.queryByText("secret loans")).toBeNull()
    expect(screen.getByText(/login page/)).toBeTruthy()
  })

  it("treats a stored user without a token as signed out", () => {
    signIn("admin")
    localStorage.removeItem("auth_token")
    renderAt(
      "/loans",
      <ProtectedRoute>
        <p>secret loans</p>
      </ProtectedRoute>
    )
    expect(screen.queryByText("secret loans")).toBeNull()
  })
})

describe("RequireAction", () => {
  const page = (
    <RequireAction action="manageCycles">
      <p>cycle controls</p>
    </RequireAction>
  )

  it("shows the page to a role that is allowed", () => {
    signIn("admin")
    renderAt("/loans", page)
    expect(screen.getByText("cycle controls")).toBeTruthy()
  })

  it.each(["chairperson", "treasurer", "secretary", "member"])(
    "tells a %s they are not allowed",
    (role) => {
      signIn(role)
      renderAt("/loans", page)
      expect(screen.queryByText("cycle controls")).toBeNull()
      expect(
        screen.getByText("You are not allowed to open this page.")
      ).toBeTruthy()
    }
  )
})
