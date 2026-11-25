import { useState } from "react"
import { markFinePaid } from "@/api/fines"
import type { Fine } from "@/api/types"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Button } from "@/components/ui/button"
import { useSession } from "@/context/session-context"
import { useI18n } from "@/i18n/i18n-context"
import { formatMoney } from "@/lib/format"
import { can } from "@/lib/permissions"

export function MarkPaid({
  fine,
  onChanged,
}: {
  fine: Fine
  onChanged: () => void
}) {
  const { session } = useSession()
  const { t, locale } = useI18n()
  const [confirming, setConfirming] = useState(false)

  if (fine.is_paid || !can("markFinePaid", session?.user.role)) {
    return null
  }

  return (
    <>
      <Button size="sm" onClick={() => setConfirming(true)}>
        {t("fines.markPaid")}
      </Button>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={t("fines.markPaidTitle")}
        body={t("fines.markPaidBody", {
          name: fine.member_name,
          amount: formatMoney(fine.fine_amount, locale),
        })}
        confirmLabel={t("fines.markPaid")}
        onConfirm={async () => {
          await markFinePaid(fine.fine_id)
          onChanged()
        }}
      />
    </>
  )
}
