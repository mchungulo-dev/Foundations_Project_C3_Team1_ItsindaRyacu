import type { SavingStatus } from "@/api/types"
import type { MessageKey } from "@/i18n/locales/en"

export const SAVING_STATUS: Record<
  SavingStatus,
  { label: MessageKey; tone: "good" | "warn" | "bad" }
> = {
  pending: { label: "savings.statusPending", tone: "warn" },
  verified: { label: "savings.statusVerified", tone: "good" },
  reversed: { label: "savings.statusReversed", tone: "bad" },
}
