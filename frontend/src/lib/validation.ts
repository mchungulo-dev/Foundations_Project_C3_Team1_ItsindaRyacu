// Accept 0788123456, 788123456, +250788123456 or 250788123456
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

/** Format for backend: Joi /^[0-9+]{10,15}$/ - use +250… for Rwanda mobiles */
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
