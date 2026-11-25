import type { AttendanceStatus, MeetingType } from "@/api/types"
import type { MessageKey } from "@/i18n/locales/en"

export const MEETING_TYPE_KEYS: Record<MeetingType, MessageKey> = {
  regular: "meetings.typeRegular",
  emergency: "meetings.typeEmergency",
  special: "meetings.typeSpecial",
}

export const ATTENDANCE_STATUS: Record<
  AttendanceStatus,
  { label: MessageKey; tone: "good" | "warn" | "bad" }
> = {
  present: { label: "meetings.statusPresent", tone: "good" },
  late: { label: "meetings.statusLate", tone: "warn" },
  absent: { label: "meetings.statusAbsent", tone: "bad" },
  excused: { label: "meetings.statusExcused", tone: "good" },
}
