import type { MemberStatus } from "@/data/demo-data"
import type { MessageKey } from "@/i18n/locales/en"

// Statuses are stored as English codes; these keys give their translations.
export const MEMBER_STATUS_KEYS: Record<MemberStatus, MessageKey> = {
  Active: "members.statusActive",
  Pending: "members.statusPending",
  Inactive: "members.statusInactive",
}
