import type { MessageKey } from "@/i18n/locales/en"

export const MEETING_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const

export const DAY_KEYS: Record<(typeof MEETING_DAYS)[number], MessageKey> = {
  Monday: "day.monday",
  Tuesday: "day.tuesday",
  Wednesday: "day.wednesday",
  Thursday: "day.thursday",
  Friday: "day.friday",
  Saturday: "day.saturday",
  Sunday: "day.sunday",
}
