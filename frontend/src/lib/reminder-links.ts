import { normalizePhone } from "@/lib/validation"

export function smsLink(phone: string, text: string) {
  return `sms:${phone}?body=${encodeURIComponent(text)}`
}

export function whatsappLink(phone: string, text: string) {
  return `https://wa.me/250${normalizePhone(phone)}?text=${encodeURIComponent(text)}`
}
