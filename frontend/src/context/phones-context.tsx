import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { getMembers } from "@/api/members"
import { useSession } from "@/context/session-context"
import { can } from "@/lib/permissions"

const PhonesContext = createContext<Record<number, string>>({})

export function PhonesProvider({ children }: { children: ReactNode }) {
  const { session } = useSession()
  const allowed = can("viewGroupFigures", session?.user.role)
  const [phones, setPhones] = useState<Record<number, string>>({})

  useEffect(() => {
    if (!allowed) {
      return
    }
    let cancelled = false
    getMembers().then(
      (members) => {
        if (!cancelled) {
          setPhones(
            Object.fromEntries(
              members.map((member) => [member.member_id, member.phone])
            )
          )
        }
      },
      () => undefined
    )
    return () => {
      cancelled = true
    }
  }, [allowed])

  return <PhonesContext value={phones}>{children}</PhonesContext>
}

export function useMemberPhone(memberId: number) {
  return useContext(PhonesContext)[memberId]
}
