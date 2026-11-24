import { describe, expect, it, vi } from "vitest"
import {
  formatDate,
  formatMoney,
  formatMonth,
  formatMonthYear,
  getToday,
} from "@/lib/format"

describe("formatMoney", () => {
  it("writes whole RWF with thousands separators", () => {
    expect(formatMoney(5000)).toBe("RWF 5,000")
    expect(formatMoney(2040000)).toBe("RWF 2,040,000")
    expect(formatMoney(0)).toBe("RWF 0")
  })

  it("drops decimals, since the group counts whole francs", () => {
    expect(formatMoney(1234.6)).toBe("RWF 1,235")
  })

  it("keeps the RWF prefix in Kinyarwanda", () => {
    expect(formatMoney(150000, "rw").startsWith("RWF ")).toBe(true)
    expect(formatMoney(150000, "rw")).toContain("150")
  })
})

describe("dates", () => {
  it("formats a day as 22 Nov 2026", () => {
    expect(formatDate("2026-11-22")).toBe("22 Nov 2026")
  })

  it("does not shift the day for the viewer's time zone", () => {
    expect(formatDate("2026-12-01")).toBe("1 Dec 2026")
    expect(formatDate("2026-01-31")).toBe("31 Jan 2026")
  })

  it("names the month, short or long, and with the year", () => {
    expect(formatMonth("2026-11-01")).toBe("November")
    expect(formatMonth("2026-11-01", "en", "short")).toBe("Nov")
    expect(formatMonthYear("2026-11-01")).toBe("November 2026")
  })
})

describe("getToday", () => {
  it("uses Kigali time, two hours ahead of UTC", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-11-22T23:30:00Z"))
    expect(getToday()).toBe("2026-11-23")
  })

  it("stays on the same day early in the evening", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-11-22T10:00:00Z"))
    expect(getToday()).toBe("2026-11-22")
  })
})
