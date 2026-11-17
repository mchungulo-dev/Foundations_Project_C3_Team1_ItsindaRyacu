import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { apiErrorText } from "@/i18n/api-messages"
import { useI18n } from "@/i18n/i18n-context"

export function LoadingRows() {
  const { t } = useI18n()

  return (
    <div role="status" aria-label={t("state.loading")} className="space-y-3">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
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

export function SampleNotice() {
  const { t } = useI18n()

  return (
    <p
      role="note"
      className="rounded-lg border border-border bg-secondary px-4 py-3 text-sm"
    >
      {t("state.sample")}
    </p>
  )
}
