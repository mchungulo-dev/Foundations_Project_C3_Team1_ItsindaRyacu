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

export function isValidNationalId(nationalId: string) {
  return /^\d{16}$/.test(nationalId)
}

export function digitsOnly(value: string, maxLength?: number) {
  const digits = value.replace(/\D/g, "")
  return maxLength === undefined ? digits : digits.slice(0, maxLength)
}
