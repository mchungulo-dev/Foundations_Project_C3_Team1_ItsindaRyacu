import type { MessageKey } from "@/i18n/locales/en"

type Translate = (
  key: MessageKey,
  params?: Record<string, string | number>
) => string

export function whenLabel(t: Translate, days: number) {
  if (days === 0) {
    return t("dashboard.meetingToday")
  }
  if (days === 1) {
    return t("dashboard.meetingTomorrow")
  }
  return t("dashboard.meetingInDays", { count: days })
}
