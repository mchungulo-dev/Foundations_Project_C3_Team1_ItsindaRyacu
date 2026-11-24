export type Member = {
  member_id: number
  member_name: string
  email: string | null
  phone: string
  national_id_number: number
  role: string
  is_active: number
  created_at: string
}

export type MemberOption = Pick<
  Member,
  "member_id" | "member_name" | "role" | "is_active"
>

export type MemberStatus = "Active" | "Pending" | "Inactive"

export type Contact = {
  phone: string
  email: string
}

export type Group = {
  group_name: string
  location: string | null
  meeting_day: string | null
  meeting_time: string | null
  savings_amount: number
  start_date: string | null
  late_fine_amount: number
  absent_fine_amount: number
  member_count: number
  total_savings: number
}

export type Leader = Pick<
  Member,
  "member_id" | "member_name" | "role" | "phone"
>

export type CycleStatus = "active" | "closed"

export type Cycle = {
  cycle_id: number
  start_date: string
  end_date: string
  contribution_amount: number
  default_interest_rate: number
  status: CycleStatus
}

export type LoanStatus =
  "requested" | "approved" | "disbursed" | "closed" | "rejected"

export type StoredLoan = {
  loan_id: number
  cycle_id: number
  member_id: number
  principal_amount: number
  interest_rate: number
  issue_date: string | null
  due_date: string
  status: LoanStatus
  approved_by: number | null
  created_at: string
}

export type Loan = StoredLoan & {
  member_name: string
  total_due: number
  total_paid: number
  remaining_balance: number
}

export type Repayment = {
  repayment_id: number
  loan_id: number
  amount_repaid: number
  payment_date: string
  status: "pending" | "verified"
  recorded_by: number
}

export type LoanLimits = {
  member_savings: number
  max_loan: number
  available_to_lend: number
  open_loan: boolean
}

export type SavingStatus = "pending" | "verified" | "reversed"

export type Saving = {
  saving_id: number
  cycle_id: number
  member_id: number
  member_name: string
  amount: number
  save_date: string
  status: SavingStatus
  client_ref?: string
  reversal_reason?: string
  recorded_by?: number
  verified_by?: number
  recorded_by_name?: string
  verified_by_name?: string
}

export type MeetingType = "regular" | "emergency" | "special"

export type Meeting = {
  meeting_id: number
  meeting_date: string
  meeting_time: string
  meeting_type: MeetingType
  minutes: string | null
  created_by: number
}

export type AttendanceStatus = "present" | "late" | "absent" | "excused"

export type StoredAttendance = {
  meeting_id: number
  member_id: number
  status: AttendanceStatus
  marked_by: number
}

export type MeetingRow = Meeting & {
  marked: number
  attended: number
  my_status: AttendanceStatus | null
}

export type AttendanceEntry = {
  member_id: number
  member_name: string
  status: AttendanceStatus
}

export type AttendanceSummaryRow = {
  member_id: number
  member_name: string
  present: number
  late: number
  absent: number
  excused: number
  recent_absent: number
}

export type StoredFine = {
  fine_id: number
  meeting_id: number | null
  member_id: number
  fine_amount: number
  reason: string
  is_paid: number
  paid_on: string | null
  recorded_by: number
  created_at: string
}

export type Fine = StoredFine & { member_name: string }

export type ShareOutRow = {
  member_id: number
  member_name: string
  savings: number
  share: number
  fines: number
  loans: number
  payout: number
  owes: number
}

export type StoredShareOut = {
  cycle_id: number
  executed_on: string
  executed_by: number
  rows: ShareOutRow[]
}

export type ShareOut = {
  cycle_id: number
  executed: boolean
  executed_on: string | null
  total_fund: number
  total_share: number
  total_fines: number
  total_loans: number
  total_payout: number
  rows: ShareOutRow[]
  blockers: { pending_savings: number; open_requests: number }
}

export type RepaymentRow = Repayment & {
  member_id: number
  member_name: string
}

export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked"

export type StoredInvitation = {
  invitation_id: number
  invite_token: string
  member_id: number
  role_assigned: string
  status: InvitationStatus
  expires_at: string
  accepted_at: string | null
  created_at: string
  invited_by: number
}

export type Invitation = StoredInvitation & { member_name: string }
