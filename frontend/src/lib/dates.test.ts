import { describe, expect, it } from "vitest"
import {
  addDays,
  cycleProgress,
  daysBetween,
  oneYearFrom,
} from "@/lib/cycle-dates"
import { daysUntil, nextMeetingDate } from "@/lib/meeting-dates"

describe("cycle dates", () => {
  it("counts days between two dates", () => {
    expect(daysBetween("2026-11-23", "2026-11-28")).toBe(5)
    expect(daysBetween("2026-11-28", "2026-11-23")).toBe(-5)
    expect(daysBetween("2026-11-23", "2026-11-23")).toBe(0)
  })

  it("adds days across month and year ends", () => {
    expect(addDays("2026-11-28", 5)).toBe("2026-12-03")
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02")
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29")
  })

  it("makes a cycle one year long, ending the day before", () => {
    expect(oneYearFrom("2026-04-01")).toBe("2027-03-31")
    expect(oneYearFrom("2027-01-01")).toBe("2027-12-31")
  })

  it("reports progress from 0 to 100 and never outside it", () => {
    expect(cycleProgress("2026-01-01", "2026-01-11", "2026-01-01")).toBe(0)
    expect(cycleProgress("2026-01-01", "2026-01-11", "2026-01-06")).toBe(50)
    expect(cycleProgress("2026-01-01", "2026-01-11", "2026-02-01")).toBe(100)
    expect(cycleProgress("2026-01-01", "2026-01-11", "2025-12-01")).toBe(0)
  })
})

describe("meeting dates", () => {
  it("finds the next meeting day in the same week", () => {
    expect(nextMeetingDate("Saturday", "2026-11-23")).toBe("2026-11-28")
    expect(nextMeetingDate("Monday", "2026-11-23")).toBe("2026-11-23")
  })

  it("rolls over into next week when the day has passed", () => {
    expect(nextMeetingDate("Sunday", "2026-11-28")).toBe("2026-11-29")
    expect(nextMeetingDate("Friday", "2026-11-28")).toBe("2026-12-04")
  })

  it("falls back to today when the group has no meeting day", () => {
    expect(nextMeetingDate(null, "2026-11-23")).toBe("2026-11-23")
    expect(nextMeetingDate("Someday", "2026-11-23")).toBe("2026-11-23")
  })

  it("counts days until a meeting", () => {
    expect(daysUntil("2026-11-28", "2026-11-23")).toBe(5)
    expect(daysUntil("2026-11-23", "2026-11-23")).toBe(0)
    expect(daysUntil("2026-11-20", "2026-11-23")).toBe(-3)
  })
})
