import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { useMemberPhone } from "@/context/phones-context"
import { useSession } from "@/context/session-context"
import { useI18n } from "@/i18n/i18n-context"
import { formatDate } from "@/lib/format"
import { smsLink, whatsappLink } from "@/lib/reminder-links"
import { showCode } from "@/pages/invitations/invitation-card"

export type Created = {
  code: string
  expiresAt: string
  memberId: number
  name: string
}

export function CodeResult({
  created,
  onClose,
}: {
  created: Created
  onClose: () => void
}) {
  const { session } = useSession()
  const { t, locale } = useI18n()
  const phone = useMemberPhone(created.memberId)
  const [copy, setCopy] = useState("")
  const until = formatDate(created.expiresAt.slice(0, 10), locale)
  const message = t("invitations.message", {
    name: created.name.split(" ")[0],
    group: session?.user.group_name ?? "",
    code: showCode(created.code),
    date: until,
  })
  const linkClass =
    "inline-flex min-h-11 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium"

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(created.code)
      setCopy(t("invitations.copied"))
    } catch {
      setCopy(t("invitations.copyFailed"))
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        {t("invitations.codeBody", { name: created.name, date: until })}
      </p>
      <p
        aria-label={t("invitations.codeTitle")}
        className="rounded-xl bg-secondary py-6 text-center font-mono text-3xl font-semibold tracking-widest select-all"
      >
        {showCode(created.code)}
      </p>
      <Button type="button" className="w-full" onClick={copyCode}>
        {t("invitations.copy")}
      </Button>
      {copy ? (
        <p role="status" className="text-sm">
          {copy}
        </p>
      ) : null}
      {phone ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t("invitations.share")}
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
        </div>
      ) : null}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          {t("invitations.done")}
        </Button>
      </DialogFooter>
    </div>
  )
}
