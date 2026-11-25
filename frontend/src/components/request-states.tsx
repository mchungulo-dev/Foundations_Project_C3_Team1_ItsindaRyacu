import { RiLoader4Line } from "@remixicon/react"
import { Link } from "react-router-dom"
import { demoMode } from "@/api/mode"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { apiErrorText } from "@/i18n/api-messages"
import { useI18n } from "@/i18n/i18n-context"

export function LoadingSpinner() {
  const { t } = useI18n()

  return (
    <div
      role="status"
      aria-label={t("state.loading")}
      className="flex justify-center py-16"
    >
      <RiLoader4Line
        className="size-9 animate-spin text-brand motion-reduce:animate-none"
        aria-hidden="true"
      />
    </div>
  )
}

export function RequestError({
  error,
  onRetry,
}: {
  error: unknown
  onRetry: () => void
}) {
  const { t } = useI18n()

  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      <p>{apiErrorText(error, t)}</p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        {t("state.retry")}
      </Button>
    </div>
  )
}

export function NotAllowed() {
  const { t } = useI18n()

  return (
    <Card>
      <CardContent className="py-10 text-center">
        <h1 className="text-2xl font-semibold">{t("state.notAllowedTitle")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("state.notAllowedBody")}
        </p>
      </CardContent>
    </Card>
  )
}

export function NotFound() {
  const { t } = useI18n()

  return (
    <Card>
      <CardContent className="py-10 text-center">
        <h1 className="text-2xl font-semibold">{t("notFound.title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("notFound.body")}
        </p>
        <Link
          to="/dashboard"
          className="mt-5 inline-flex min-h-11 items-center font-medium text-brand underline underline-offset-4"
        >
          {t("notFound.back")}
        </Link>
      </CardContent>
    </Card>
  )
}

// In demo mode every screen runs on sample data, and says so. Connected to the
// server there is nothing to say.
export function SampleNotice() {
  const { t } = useI18n()

  if (!demoMode) {
    return null
  }

  return (
    <p
      role="note"
      className="w-fit max-w-full rounded-lg bg-secondary px-3 py-1.5 text-xs text-secondary-foreground"
    >
      {t("state.demo")}
    </p>
  )
}
