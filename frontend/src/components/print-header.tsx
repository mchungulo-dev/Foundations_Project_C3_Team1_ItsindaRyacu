import { useSession } from "@/context/session-context"
import { useI18n } from "@/i18n/i18n-context"
import { formatDate, getToday } from "@/lib/format"

export function PrintHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  const { session } = useSession()
  const { t, locale } = useI18n()

  return (
    <div className="mb-6 hidden space-y-1 border-b border-border pb-4 print:block">
      <p className="text-sm">
        {t("app.title")} · {session?.user.group_name}
      </p>
      <p className="text-2xl font-semibold">{title}</p>
      <p className="text-sm">{subtitle}</p>
      <p className="text-sm">
        {t("statements.printed", { date: formatDate(getToday(), locale) })}
      </p>
    </div>
  )
}
