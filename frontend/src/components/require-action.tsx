import type { ReactNode } from "react"
import { NotAllowed } from "@/components/request-states"
import { useSession } from "@/context/session-context"
import { can, type Action } from "@/lib/permissions"

export function RequireAction({
  action,
  children,
}: {
  action: Action
  children: ReactNode
}) {
  const { session } = useSession()

  return can(action, session?.user.role) ? <>{children}</> : <NotAllowed />
}
