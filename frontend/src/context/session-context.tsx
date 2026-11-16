import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  clearSessionUser,
  formatRoleLabel,
  firstNameFromFullName,
  initialsFromName,
  persistSessionUser,
  readSessionUser,
  type SessionUser,
} from "@/lib/auth-session"
import type { LoginResponse } from "@/lib/api"
import { clearAuthToken } from "@/lib/auth-token"

export type SessionDisplay = {
  user: SessionUser
  firstName: string
  initials: string
  roleLabel: string
}

type SessionContextValue = {
  session: SessionDisplay | null
  setLoginSession: (data: LoginResponse) => void
  clearSession: () => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

function toDisplay(user: SessionUser): SessionDisplay {
  return {
    user,
    firstName: firstNameFromFullName(user.member_name),
    initials: initialsFromName(user.member_name),
    roleLabel: formatRoleLabel(user.role),
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionDisplay | null>(() => {
    const stored = readSessionUser()
    return stored ? toDisplay(stored) : null
  })

  const setLoginSession = useCallback((data: LoginResponse) => {
    if (data.user) {
      persistSessionUser(data.user)
      setSession(toDisplay(data.user))
    }
  }, [])

  const clearSession = useCallback(() => {
    clearAuthToken()
    clearSessionUser()
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({ session, setLoginSession, clearSession }),
    [session, setLoginSession, clearSession]
  )

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error("useSession must be used within SessionProvider")
  }
  return context
}
