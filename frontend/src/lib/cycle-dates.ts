const DAY_MS = 86_400_000

export function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS)
}

export function cycleProgress(start: string, end: string, today: string) {
  const total = daysBetween(start, end)
  if (total <= 0) {
    return 100
  }
  const done = Math.round((daysBetween(start, today) / total) * 100)
  return Math.min(100, Math.max(0, done))
}

export function addDays(date: string, days: number) {
  return new Date(Date.parse(date) + days * DAY_MS).toISOString().slice(0, 10)
}

export function oneYearFrom(start: string) {
  const date = new Date(`${start}T00:00:00Z`)
  date.setUTCFullYear(date.getUTCFullYear() + 1)
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}
