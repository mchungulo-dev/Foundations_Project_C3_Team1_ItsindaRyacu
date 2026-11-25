import { RiWallet3Line } from "@remixicon/react"
import type { Saving } from "@/api/types"
import { Initials, ListRow, RowIcon, RowList } from "@/components/list-row"
import { SectionCard, SectionLink } from "@/components/section-card"
import { StatusBadge } from "@/components/status-badge"
import { useI18n } from "@/i18n/i18n-context"
import { formatDate, formatMoney } from "@/lib/format"
import { SAVING_STATUS } from "@/pages/savings/saving-status"

type RecentSavingsProps = {
  title: string
  rows: Saving[]
  showMember: boolean
  emptyText: string
  className?: string
}

export function RecentSavings({
  title,
  rows,
  showMember,
  emptyText,
  className,
}: RecentSavingsProps) {
  const { t, locale } = useI18n()

  return (
    <SectionCard
      title={title}
      className={className}
      action={<SectionLink to="/savings">{t("dashboard.viewAll")}</SectionLink>}
    >
      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
          <RiWallet3Line
            className="mx-auto mb-3 size-7 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        </div>
      ) : (
        <RowList>
          {rows.map((saving) => {
            const { label, tone } = SAVING_STATUS[saving.status]
            return (
              <ListRow
                key={saving.saving_id}
                leading={
                  showMember ? (
                    <Initials name={saving.member_name} />
                  ) : (
                    <RowIcon>
                      <RiWallet3Line />
                    </RowIcon>
                  )
                }
                title={showMember ? saving.member_name : t("savings.title")}
                subtitle={formatDate(saving.save_date, locale)}
                value={`+ ${formatMoney(saving.amount, locale)}`}
                note={<StatusBadge tone={tone}>{t(label)}</StatusBadge>}
              />
            )
          })}
        </RowList>
      )}
    </SectionCard>
  )
}
