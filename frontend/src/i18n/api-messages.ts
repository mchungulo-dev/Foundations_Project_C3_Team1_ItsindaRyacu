import { ApiError } from "@/lib/api"
import type { I18nContextValue } from "@/i18n/i18n-context"
import type { MessageKey } from "@/i18n/locales/en"

type Translate = I18nContextValue["t"]

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
  "A cycle is already active. Close the cycle first before creating a new one":
    "api.cycleActive",
  "Cycle not found!": "api.cycleNotFound",
  "This cycle is already closed.": "api.cycleClosed",
  "Cycle not found or already closed": "api.cycleClosed",
  "Cycle contains active loans. Cycle cannot be closed": "api.cycleHasLoans",
  "Access denied. Your role cannot do this.": "api.forbidden",
  "Access denied.": "api.forbidden",
  "No active savings cycle found.": "api.noActiveCycle",
  "The member is not active.": "api.memberInactive",
  "A reversed saving cannot be verified.": "api.savingReversed",
  "Saving not found!": "api.savingNotFound",
  "Loan not found!": "api.loanNotFound",
  "Current password is incorrect.": "api.wrongPassword",
  "Invitation code does not exist!": "api.inviteNotFound",
  "Invitation code has expired!": "api.inviteExpired",
  "Invitation code has already been used!": "api.inviteUsed",
  "Invitation code was revoked.": "api.inviteRevoked",
  "Invitation code is required!": "api.inviteRequired",
  "Invitation not found!": "api.inviteMissing",
  "This invitation was already used.": "api.inviteAlreadyUsed",
  "Only admins can assign a role.": "api.roleAdminOnly",
  "The share-out for this cycle was already executed.": "api.shareOutDone",
  "Resolve pending savings and loan requests first.": "api.shareOutBlocked",
  "No savings recorded for this cycle": "api.shareOutNoSavings",
  "Meeting not found.": "api.meetingNotFound",
  "Fine not found.": "api.fineNotFound",
  "This fine was already issued for this meeting.": "api.fineDuplicate",
  "Minutes content is required.": "api.minutesRequired",
  "Attendance can only be taken on or after the meeting day.":
    "api.attendanceFuture",
  "This loan application has already been reviewed!": "api.loanReviewed",
  "No approved loan found in your group to disburse.": "api.loanNotApproved",
  "Repayments require a disbursed loan.": "api.loanNotPaidOut",
  "You already have a pending loan application for this cycle!":
    "api.loanPending",
  "Payment exceeds the remaining balance!": "api.overBalance",
  "Provide a valid loan ID and positive whole-RWF amount.": "api.repayInvalid",
  "Savings cycle not found in your group!": "api.cycleNotFound",
  "Member not found or already deactivated!": "api.memberNotFound",
  "You already have an open loan. Repay it before asking for another.":
    "api.loanOpen",
  "A reason is required": "savings.reasonRequired",
  "Mark at least one member": "meetings.markOne",
  "Date must be inside the cycle": "validation.dateOutsideCycle",
  "Amount must be a positive whole number of RWF": "validation.amountInvalid",
  "Date must be a real date that is not in the future":
    "validation.dateInvalid",
  "Meeting time must be a 24-hour time such as 16:00":
    "validation.meetingTimeInvalid",
  "Meeting date must be a real date": "validation.meetingDateRequired",
  "Interest rate must be 0 or more": "validation.rateInvalid",
  "Due date must be in the future": "loans.dueInvalid",
  "Enter an end date after the start date, a positive amount and a rate of 0 or more":
    "validation.endDateRequired",
  "Password must be between 8 and 128 characters": "validation.passwordShort",
  "Reason is required and must be 200 characters or fewer":
    "fines.reasonRequired",
  "Status must be present, late, absent or excused": "api.attendanceStatus",
  "New password must be different from the current password":
    "api.samePassword",
  "Choose a role and a validity of 1 hour to 30 days": "api.roleExpiry",
  "Meeting type must be regular, emergency or special": "api.meetingType",
}

const PATTERNS: [RegExp, MessageKey, string][] = [
  [
    /^Savings waiting to be verified: (\d+)$/,
    "shareOut.blockerPending",
    "count",
  ],
  [
    /^Loan requests not yet paid out or decided: (\d+)$/,
    "shareOut.blockerRequests",
    "count",
  ],
  [/^You can borrow up to (RWF [\d,.]+),/, "loans.overMax", "amount"],
  [/^The group can lend (RWF [\d,.]+) right now/, "loans.overGroup", "amount"],
]

export function translateBackendMessage(message: string, t: Translate) {
  const key = BACKEND_MESSAGES[message]
  if (key) {
    return t(key)
  }
  for (const [pattern, patternKey, name] of PATTERNS) {
    const match = pattern.exec(message)
    if (match) {
      return t(patternKey, { [name]: match[1] })
    }
  }
  return message
}

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
