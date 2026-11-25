import { useSession } from "@/context/session-context"
import { useMemberPhone } from "@/context/phones-context"
import { useI18n } from "@/i18n/i18n-context"
import type { MessageKey } from "@/i18n/locales/en"
import { can } from "@/lib/permissions"
import { smsLink, whatsappLink } from "@/lib/reminder-links"

const linkClass =
  "inline-flex min-h-11 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium"

export function RemindLinks({
  memberId,
  name,
  kind,
  params,
}: {
  memberId: number
  name: string
  kind: MessageKey
  params?: Record<string, string | number>
}) {
  const { session } = useSession()
  const { t } = useI18n()
  const phone = useMemberPhone(memberId)

  if (
    !phone ||
    memberId === session?.user.member_id ||
    !can("viewGroupFigures", session?.user.role)
  ) {
    return null
  }

  const message = t(kind, {
    name: name.split(" ")[0],
    group: session?.user.group_name ?? "",
    ...params,
  })

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {t("reminder.send")}
      </span>
      <a href={smsLink(phone, message)} className={linkClass}>
        {t("reminder.sms")}
      </a>
      <a
        href={whatsappLink(phone, message)}
        target="_blank"
        rel="noreferrer"
        className={linkClass}
      >
        {t("reminder.whatsapp")}
      </a>
    </span>
  )
}
