// Accept 0788123456, 788123456, +250788123456 or 250788123456
// Spaces and hyphens are allowed
export function isValidRwandaPhone(phone: string) {
  const digits = phone.replace(/[\s-]/g, "")
  return /^(?:\+?250|0)?7[2389]\d{7}$/.test(digits)
}
