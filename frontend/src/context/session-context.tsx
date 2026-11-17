import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
import { SESSION_EXPIRED_EVENT, type LoginResponse } from "@/lib/api"
import { clearAuthToken, getAuthToken, isTokenExpired } from "@/lib/auth-token"

export type SessionDisplay = {
  user: SessionUser
  firstName: string
  initials: string
  roleLabel: string
}

type SessionContextValue = {
  session: SessionDisplay | null
  expired: boolean
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

type SessionState = { session: SessionDisplay | null; expired: boolean }

function restoreSession(): SessionState {
  const stored = readSessionUser()
  const token = getAuthToken()
  if (stored && token && !isTokenExpired(token)) {
    return { session: toDisplay(stored), expired: false }
  }
  if (stored || token) {
    clearAuthToken()
    clearSessionUser()
    return { session: null, expired: Boolean(token && isTokenExpired(token)) }
  }
  return { session: null, expired: false }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(restoreSession)

  const setLoginSession = useCallback((data: LoginResponse) => {
    if (data.user) {
      persistSessionUser(data.user)
      setState({ session: toDisplay(data.user), expired: false })
    }
  }, [])

  const clearSession = useCallback(() => {
    clearAuthToken()
    clearSessionUser()
    setState({ session: null, expired: false })
  }, [])

  useEffect(() => {
    function handleExpired() {
      clearAuthToken()
      clearSessionUser()
      setState({ session: null, expired: true })
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired)
    return () =>
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired)
  }, [])

  const value = useMemo(
    () => ({
      session: state.session,
      expired: state.expired,
      setLoginSession,
      clearSession,
    }),
    [state, setLoginSession, clearSession]
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
