import { getFines } from "@/api/fines"
import { ListRow, RowList } from "@/components/list-row"
import { SectionCard, SectionLink } from "@/components/section-card"
import { useRequest } from "@/hooks/use-request"
import { useI18n } from "@/i18n/i18n-context"
import { formatDate, formatMoney } from "@/lib/format"

export function MemberFines({ memberId }: { memberId: number }) {
  const { t, locale } = useI18n()
  const { data } = useRequest(getFines)
  const unpaid = (data ?? []).filter(
    (fine) => fine.member_id === memberId && !fine.is_paid
  )

  if (!data) {
    return null
  }

  return (
    <SectionCard
      title={t("fines.memberTitle")}
      action={<SectionLink to="/fines">{t("dashboard.viewFines")}</SectionLink>}
    >
      {unpaid.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("fines.memberNone")}</p>
      ) : (
        <RowList>
          {unpaid.map((fine) => (
            <ListRow
              key={fine.fine_id}
              title={fine.reason}
              subtitle={formatDate(fine.created_at.slice(0, 10), locale)}
              note={
                <span className="font-semibold tabular-nums">
                  {formatMoney(fine.fine_amount, locale)}
                </span>
              }
            />
          ))}
        </RowList>
      )}
    </SectionCard>
  )
}
