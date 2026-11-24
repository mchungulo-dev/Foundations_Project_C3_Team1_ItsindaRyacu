import { addDays } from "@/lib/cycle-dates"
import { MEETING_DAYS } from "@/lib/meeting-days"

export function nextMeetingDate(day: string | null, from: string) {
  const index = MEETING_DAYS.findIndex((name) => name === day)
  if (index < 0) {
    return from
  }
  const target = (index + 1) % 7
  const today = new Date(`${from}T00:00:00Z`).getUTCDay()
  return addDays(from, (target - today + 7) % 7)
}

const DAY = 86_400_000

export function daysUntil(date: string, today: string) {
  return Math.round((Date.parse(date) - Date.parse(today)) / DAY)
}
