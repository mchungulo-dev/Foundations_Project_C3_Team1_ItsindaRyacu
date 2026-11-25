import type { LoanStatus } from "@/api/types"
import type { MessageKey } from "@/i18n/locales/en"

export const LOAN_STATUS: Record<
  LoanStatus,
  { label: MessageKey; tone: "good" | "warn" | "bad" }
> = {
  requested: { label: "loans.statusRequested", tone: "warn" },
  approved: { label: "loans.statusApproved", tone: "good" },
  disbursed: { label: "loans.statusDisbursed", tone: "good" },
  closed: { label: "loans.statusClosed", tone: "good" },
  rejected: { label: "loans.statusRejected", tone: "bad" },
}
