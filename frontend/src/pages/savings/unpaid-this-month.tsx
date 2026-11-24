import type { MemberOption, Saving } from "@/api/types"
import { Initials, ListRow, RowList } from "@/components/list-row"
import { RemindLinks } from "@/components/remind-links"
import { SectionCard, SectionLink } from "@/components/section-card"
import { useI18n } from "@/i18n/i18n-context"
import { formatMoney, formatMonth, getToday } from "@/lib/format"

type UnpaidThisMonthProps = {
  members: MemberOption[]
  savings: Saving[]
  amount: number
  limit?: number
  month?: string
}

export function UnpaidThisMonth({
  members,
  savings,
  amount,
  limit,
  month: chosen,
}: UnpaidThisMonthProps) {
  const { t, locale } = useI18n()
  const month = (chosen ?? getToday()).slice(0, 7)
  const isCurrent = month === getToday().slice(0, 7)
  const monthName = formatMonth(`${month}-01`, locale)
  const paid = new Set(
    savings
      .filter(
        (item) => item.status !== "reversed" && item.save_date.startsWith(month)
      )
      .map((item) => item.member_id)
  )
  const waiting = members.filter(
    (member) => member.is_active && !paid.has(member.member_id)
  )
  const shown = limit ? waiting.slice(0, limit) : waiting
  const hidden = waiting.length - shown.length

  return (
    <SectionCard
      title={
        isCurrent
          ? t("savings.unpaidMonth")
          : t("dashboard.unpaidIn", { month: monthName })
      }
      action={
        hidden > 0 ? (
          <SectionLink to="/savings">
            {t("dashboard.moreMembers", { count: hidden })}
          </SectionLink>
        ) : null
      }
    >
      {waiting.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isCurrent
            ? t("savings.unpaidNone")
            : t("dashboard.unpaidNoneIn", { month: monthName })}
        </p>
      ) : (
        <div className="flex h-full flex-col gap-4">
          <RowList>
            {shown.map((member) => (
              <ListRow
                key={member.member_id}
                leading={<Initials name={member.member_name} />}
                title={member.member_name}
                note={
                  <span className="font-semibold tabular-nums">
                    {formatMoney(amount, locale)}
                  </span>
                }
              >
                <RemindLinks
                  memberId={member.member_id}
                  name={member.member_name}
                  kind="reminder.contribution"
                  params={{
                    amount: formatMoney(amount, locale),
                    month: monthName,
                  }}
                />
              </ListRow>
            ))}
          </RowList>
          <p className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4 text-sm">
            <span className="text-muted-foreground">
              {t("dashboard.stillToCollect")}
            </span>
            <span className="font-semibold tabular-nums">
              {formatMoney(waiting.length * amount, locale)}
            </span>
          </p>
        </div>
      )}
    </SectionCard>
  )
}
