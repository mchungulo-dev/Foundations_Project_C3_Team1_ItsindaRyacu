import { describe, expect, it } from "vitest"
import {
  digitsOnly,
  isEndAfterStart,
  isValidAmount,
  isValidDate,
  isValidEmail,
  isValidFine,
  isValidMeetingTime,
  isValidNationalId,
  isValidPassword,
  isValidRate,
  isValidRwandaPhone,
  normalizePhone,
  phoneForApi,
} from "@/lib/validation"

describe("amounts", () => {
  it("accepts whole RWF above zero", () => {
    expect(isValidAmount("20000")).toBe(true)
    expect(isValidAmount("1")).toBe(true)
  })

  it.each(["", "0", "-5000", "20.5", "2e4", " 500", "abc"])(
    "refuses %j",
    (value) => {
      expect(isValidAmount(value)).toBe(false)
    }
  )

  it("refuses a number too large to count exactly", () => {
    expect(isValidAmount("99999999999999999999")).toBe(false)
  })

  it("lets a fine be empty or zero, but not negative or fractional", () => {
    expect(isValidFine("")).toBe(true)
    expect(isValidFine("0")).toBe(true)
    expect(isValidFine("500")).toBe(true)
    expect(isValidFine("-1")).toBe(false)
    expect(isValidFine("2.5")).toBe(false)
  })

  it("keeps only digits when typing an amount", () => {
    expect(digitsOnly("RWF 20,000")).toBe("20000")
    expect(digitsOnly("0788123456789", 10)).toBe("0788123456")
  })

  it("accepts rates from 0 to 100", () => {
    expect(isValidRate("5")).toBe(true)
    expect(isValidRate("2.5")).toBe(true)
    expect(isValidRate("100")).toBe(true)
    expect(isValidRate("101")).toBe(false)
    expect(isValidRate("-1")).toBe(false)
  })
})

describe("phones", () => {
  it.each([
    "0788123456",
    "788123456",
    "+250788123456",
    "250788123456",
    "0788 123 456",
    "0788-123-456",
    "0722123456",
    "0732123456",
    "0792123456",
  ])("accepts %s", (phone) => {
    expect(isValidRwandaPhone(phone)).toBe(true)
  })

  it.each(["", "0788", "0712345678", "+254788123456", "07881234567", "abc"])(
    "refuses %j",
    (phone) => {
      expect(isValidRwandaPhone(phone)).toBe(false)
    }
  )

  it("turns every way of writing a number into +250 for the server", () => {
    for (const phone of [
      "0788123456",
      "788123456",
      "250788123456",
      "+250788123456",
      "0788 123 456",
    ]) {
      expect(phoneForApi(phone)).toBe("+250788123456")
    }
  })

  it("treats different spellings of one number as equal when searching", () => {
    expect(normalizePhone("0788 123 456")).toBe(normalizePhone("+250788123456"))
    expect(normalizePhone("+250788123456")).toBe("788123456")
  })
})

describe("dates", () => {
  it("accepts a real day written year first", () => {
    expect(isValidDate("2026-11-22")).toBe(true)
    expect(isValidDate("2028-02-29")).toBe(true)
  })

  it.each(["", "22/11/2026", "2026-13-01", "2026-02-30", "2027-02-29", "x"])(
    "refuses %j",
    (value) => {
      expect(isValidDate(value)).toBe(false)
    }
  )

  it("needs the end after the start", () => {
    expect(isEndAfterStart("2026-04-01", "2027-03-31")).toBe(true)
    expect(isEndAfterStart("2026-04-01", "2026-04-01")).toBe(false)
    expect(isEndAfterStart("2026-04-02", "2026-04-01")).toBe(false)
    expect(isEndAfterStart("nope", "2026-04-01")).toBe(false)
  })

  it("checks meeting times as 24-hour HH:MM", () => {
    expect(isValidMeetingTime("16:00")).toBe(true)
    expect(isValidMeetingTime("00:00")).toBe(true)
    expect(isValidMeetingTime("24:00")).toBe(false)
    expect(isValidMeetingTime("9:00")).toBe(false)
    expect(isValidMeetingTime("16:60")).toBe(false)
  })
})

describe("other fields", () => {
  it("checks emails, passwords and national ids", () => {
    expect(isValidEmail("a@b.rw")).toBe(true)
    expect(isValidEmail("a@b")).toBe(false)
    expect(isValidEmail("a b@c.rw")).toBe(false)
    expect(isValidPassword("12345678")).toBe(true)
    expect(isValidPassword("1234567")).toBe(false)
    expect(isValidNationalId("1198100011242486")).toBe(true)
    expect(isValidNationalId("119810001124248")).toBe(false)
  })
})
