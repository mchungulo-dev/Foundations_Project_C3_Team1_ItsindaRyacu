// Accept 0788123456, 788123456, +250788123456 or 250788123456
// Spaces and hyphens are allowed
export function isValidRwandaPhone(phone: string) {
  const digits = phone.replace(/[\s-]/g, "")
  return /^(?:\+?250|0)?7[2389]\d{7}$/.test(digits)
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function isValidPassword(password: string) {
  return password.length >= 8 && password.length <= 128
}

export function isValidMeetingTime(time: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time)
}

export function normalizePhoneDigits(phone: string) {
  return phone.replace(/[\s-]/g, "")
}

export function phoneForApi(phone: string): string {
  const digits = normalizePhoneDigits(phone)
  if (digits.startsWith("+250")) {
    return digits
  }
  if (digits.startsWith("250")) {
    return `+${digits}`
  }
  if (/^0(7[2389]\d{7})$/.test(digits)) {
    return `+250${digits.slice(1)}`
  }
  if (/^7[2389]\d{7}$/.test(digits)) {
    return `+250${digits}`
  }
  return digits
}

export function isValidNationalId(nationalId: string) {
  return /^\d{16}$/.test(nationalId)
}

export function digitsOnly(value: string, maxLength?: number) {
  const digits = value.replace(/\D/g, "")
  return maxLength === undefined ? digits : digits.slice(0, maxLength)
}

// Whole RWF, greater than zero
export function isValidAmount(value: string) {
  return (
    /^\d+$/.test(value) &&
    Number.isSafeInteger(Number(value)) &&
    Number(value) > 0
  )
}

export function isEndAfterStart(start: string, end: string) {
  return isValidDate(start) && isValidDate(end) && end > start
}

// A percentage from 0 to 100, decimals allowed
export function isValidRate(value: string) {
  return /^\d+(\.\d+)?$/.test(value) && Number(value) <= 100
}

// Empty means none; otherwise whole RWF, zero allowed
export function isValidFine(value: string) {
  return (
    value === "" || (/^\d+$/.test(value) && Number.isSafeInteger(Number(value)))
  )
}

export function hasErrors(errors: Record<string, string>) {
  return Object.values(errors).some(Boolean)
}

// A real calendar date written as YYYY-MM-DD
export function isValidDate(value: string) {
  const date = new Date(value)
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  )
}

// Digits without the country code or leading zero, so different ways of
// writing the same number compare equal: 0788 123 456 and +250788123456.
export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "").replace(/^(?:250|0)/, "")
}
