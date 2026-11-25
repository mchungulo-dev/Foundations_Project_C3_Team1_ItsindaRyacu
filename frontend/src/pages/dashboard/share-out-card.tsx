import { Link } from "react-router-dom"
import type { ShareOut } from "@/api/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSession } from "@/context/session-context"
import { useI18n } from "@/i18n/i18n-context"
import { formatMoney } from "@/lib/format"

export function ShareOutCard({ shareOut }: { shareOut: ShareOut | null }) {
  const { session } = useSession()
  const { t, locale } = useI18n()
  const mine = shareOut?.executed
    ? shareOut.rows.find((row) => row.member_id === session?.user.member_id)
    : null

  if (!mine) {
    return null
  }

  return (
    <Card className="border-0 bg-[#006b4f] text-white">
      <CardContent className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-white/85">
            {t("dashboard.shareOutTitle")}
          </p>
          <p className="mt-2 text-xl font-semibold">
            {t("dashboard.shareOutBody", {
              amount: formatMoney(mine.payout, locale),
            })}
          </p>
        </div>
        <Button
          variant="secondary"
          render={<Link to="/share-out" />}
          nativeButton={false}
        >
          {t("nav.shareOut")}
        </Button>
      </CardContent>
    </Card>
  )
}
