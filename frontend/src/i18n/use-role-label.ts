import { useCallback } from "react"
import { formatRoleLabel } from "@/lib/auth-session"
import { useI18n } from "@/i18n/i18n-context"
import type { MessageKey } from "@/i18n/locales/en"

const ROLE_KEYS: Record<string, MessageKey> = {
  admin: "role.admin",
  member: "role.member",
  chairperson: "role.chairperson",
  treasurer: "role.treasurer",
  secretary: "role.secretary",
}

// Role names come from the backend as codes ("admin"). Translate the known
// ones and fall back to the existing English formatter for anything else.
export function useRoleLabel() {
  const { t } = useI18n()
  return useCallback(
    (role: string) => {
      const key = ROLE_KEYS[role]
      return key ? t(key) : formatRoleLabel(role)
    },
    [t]
  )
}
