import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useSession } from "@/context/session-context"

export function useSignOut() {
  const navigate = useNavigate()
  const { clearSession } = useSession()

  return useCallback(() => {
    clearSession()
    navigate("/login", { replace: true })
  }, [clearSession, navigate])
}
