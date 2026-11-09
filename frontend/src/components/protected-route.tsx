import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { getAuthToken } from "@/lib/auth-token"

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation()
  const token = getAuthToken()

  if (!token) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    )
  }

  return <>{children}</>
}
