import { Link } from "react-router-dom"
import { RiSeedlingLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSession } from "@/context/session-context"
import { useI18n } from "@/i18n/i18n-context"
import { can } from "@/lib/permissions"

export function GettingStarted() {
  const { session } = useSession()
  const { t } = useI18n()
  const role = session?.user.role
  const canStart = can("manageCycles", role)

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <RiSeedlingLine className="size-8 text-brand" aria-hidden="true" />
        <h2 className="text-xl font-semibold">{t("dashboard.noCycleTitle")}</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          {t(canStart ? "dashboard.noCycleAdmin" : "dashboard.noCycleOthers")}
        </p>
        {canStart ? (
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button render={<Link to="/cycles" />} nativeButton={false}>
              {t("cycles.start")}
            </Button>
            <Button
              variant="outline"
              render={<Link to="/members" />}
              nativeButton={false}
            >
              {t("members.add")}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
