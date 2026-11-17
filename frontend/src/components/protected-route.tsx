import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useSession } from "@/context/session-context"

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { session, expired } = useSession()

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, expired }}
      />
    )
  }

  return <>{children}</>
}
