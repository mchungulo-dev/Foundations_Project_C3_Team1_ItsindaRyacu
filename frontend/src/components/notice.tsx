import { RiCheckLine, RiCloseLine } from "@remixicon/react"
import { useI18n } from "@/i18n/i18n-context"

export function Notice({
  message,
  onClose,
}: {
  message: string
  onClose: () => void
}) {
  const { t } = useI18n()

  return (
    <div
      role="status"
      className="flex items-start justify-between gap-3 rounded-lg bg-secondary p-4 text-sm"
    >
      <span className="flex items-center gap-2">
        <RiCheckLine
          className="size-5 shrink-0 text-brand"
          aria-hidden="true"
        />
        {message}
      </span>
      <button
        type="button"
        aria-label={t("action.dismiss")}
        onClick={onClose}
        className="-m-2 p-2 text-muted-foreground hover:text-foreground"
      >
        <RiCloseLine className="size-5" aria-hidden="true" />
      </button>
    </div>
  )
}
