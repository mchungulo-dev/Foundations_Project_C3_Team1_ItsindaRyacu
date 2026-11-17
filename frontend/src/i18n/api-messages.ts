import { ApiError } from "@/lib/api"
import type { I18nContextValue } from "@/i18n/i18n-context"
import type { MessageKey } from "@/i18n/locales/en"

type Translate = I18nContextValue["t"]

// The backend returns English sentences, not error codes. These are the exact
// strings it sends today (backend/routers/*.js). Anything not listed here is
// shown as the server wrote it, so a reworded backend message degrades to
// English instead of breaking. Ask the backend team for error codes later.
const BACKEND_MESSAGES: Record<string, MessageKey> = {
  "Invalid email or password!": "api.invalidCredentials",
  "Your account or savings group is inactive!": "api.inactive",
  "Login credentials have not been set up for this account.":
    "api.noCredentials",
  "Validation failed!": "api.validation",
  "A group with this admin email already exists!": "api.groupEmailExists",
  "Email, phone number or national ID already exists!": "api.duplicateIdentity",
  "Internal Server Error!": "api.server",
  "Member not found!": "api.memberNotFound",
  "Only admins can perform this action!": "api.forbidden",
  "Only admins can add members!": "api.forbidden",
  "Authentication token required!": "api.sessionEnded",
  "Invalid or expired token!": "api.sessionEnded",
  "Savings group registered successfully!": "api.groupRegistered",
}

export function translateBackendMessage(message: string, t: Translate) {
  const key = BACKEND_MESSAGES[message]
  return key ? t(key) : message
}

// Text for any error thrown by an API call.
export function apiErrorText(error: unknown, t: Translate) {
  if (error instanceof ApiError) {
    if (
      error.status === 403 &&
      !(error.body && typeof error.body === "object" && "message" in error.body)
    ) {
      return t("api.forbidden")
    }
    return translateBackendMessage(error.message, t)
  }
  return t("api.network")
}
