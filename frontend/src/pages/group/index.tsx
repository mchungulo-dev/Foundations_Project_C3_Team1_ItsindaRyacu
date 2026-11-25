import { useState } from "react"
import { RiPhoneLine } from "@remixicon/react"
import { getGroup, getLeaders } from "@/api/group"
import type { Group, Leader } from "@/api/types"
import { Initials, ListRow, RowList } from "@/components/list-row"
import {
  LoadingSpinner,
  RequestError,
  SampleNotice,
} from "@/components/request-states"
import { SectionCard, SectionLink } from "@/components/section-card"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { useSession } from "@/context/session-context"
import { useRequest } from "@/hooks/use-request"
import { useI18n } from "@/i18n/i18n-context"
import { useRoleLabel } from "@/i18n/use-role-label"
import { formatDate, formatMoney } from "@/lib/format"
import { DAY_KEYS } from "@/lib/meeting-days"
import { can } from "@/lib/permissions"
import { EditGroupDialog } from "@/pages/group/edit-group"

const LEADER_ROLES = ["chairperson", "treasurer", "secretary"]
const loadGroupPage = () => Promise.all([getGroup(), getLeaders()])

export function GroupPage() {
  const { data, error, reload } = useRequest(loadGroupPage)

  if (error) {
    return <RequestError error={error} onRetry={reload} />
  }
  if (!data) {
    return <LoadingSpinner />
  }
  const [group, leaders] = data
  return <GroupView group={group} leaders={leaders} onChanged={reload} />
}

type GroupViewProps = {
  group: Group
  leaders: Leader[]
  onChanged: () => void
}

function Facts({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="divide-y divide-border">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
        >
          <dt className="text-sm text-muted-foreground">{label}</dt>
          <dd className="text-right font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function GroupView({ group, leaders, onChanged }: GroupViewProps) {
  const { session } = useSession()
  const { t, locale } = useI18n()
  const roleLabel = useRoleLabel()
  const [editing, setEditing] = useState(false)
  const role = session?.user.role
  const notSet = t("group.notSet")
  const day = group.meeting_day
  const money = (amount: number) => formatMoney(amount, locale)
  const dayLabel = day
    ? day in DAY_KEYS
      ? t(DAY_KEYS[day as keyof typeof DAY_KEYS])
      : day
    : notSet

  return (
    <div className="space-y-6">
      <SampleNotice />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {group.group_name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {[
              group.location,
              day ? `${dayLabel} ${group.meeting_time ?? ""}` : "",
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        {can("editGroup", role) ? (
          <Button onClick={() => setEditing(true)} className="w-full sm:w-auto">
            {t("group.edit")}
          </Button>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
        <StatCard
          highlight
          className="col-span-2 xl:col-span-1"
          label={t("group.members")}
          value={String(group.member_count)}
          action={
            can("viewMembers", role)
              ? { to: "/members", label: t("group.seeMembers") }
              : undefined
          }
        />
        <StatCard
          label={t("group.totalSaved")}
          value={money(group.total_savings)}
          action={{ to: "/savings", label: t("nav.savings") }}
        />
        <StatCard
          label={t("group.monthlySaving")}
          value={money(group.savings_amount)}
          action={{ to: "/cycles", label: t("group.seeCycles") }}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title={t("group.meetingsTitle")}>
          <Facts
            rows={[
              [t("group.location"), group.location || notSet],
              [t("group.meetingDay"), dayLabel],
              [t("group.meetingTime"), group.meeting_time || notSet],
              [
                t("group.startDate"),
                group.start_date
                  ? formatDate(group.start_date, locale)
                  : notSet,
              ],
            ]}
          />
        </SectionCard>
        <SectionCard title={t("group.rulesTitle")}>
          <Facts
            rows={[
              [t("group.monthlySaving"), money(group.savings_amount)],
              [t("group.lateFine"), money(group.late_fine_amount)],
              [t("group.absentFine"), money(group.absent_fine_amount)],
            ]}
          />
        </SectionCard>
      </div>
      <SectionCard
        title={t("group.leadersTitle")}
        action={
          can("viewMembers", role) ? (
            <SectionLink to="/members">{t("group.seeMembers")}</SectionLink>
          ) : undefined
        }
      >
        <RowList>
          {LEADER_ROLES.flatMap((leaderRole) => {
            const holders = leaders.filter((item) => item.role === leaderRole)
            return holders.length === 0
              ? [
                  <ListRow
                    key={leaderRole}
                    title={t("group.leaderNone")}
                    subtitle={roleLabel(leaderRole)}
                  />,
                ]
              : holders.map((holder) => (
                  <ListRow
                    key={holder.member_id}
                    leading={<Initials name={holder.member_name} />}
                    title={holder.member_name}
                    subtitle={roleLabel(leaderRole)}
                    note={
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label={`${t("members.call")} ${holder.member_name}`}
                        render={<a href={`tel:${holder.phone}`} />}
                        nativeButton={false}
                      >
                        <RiPhoneLine aria-hidden="true" />
                      </Button>
                    }
                  />
                ))
          })}
        </RowList>
      </SectionCard>
      <EditGroupDialog
        open={editing}
        onOpenChange={setEditing}
        group={group}
        onSaved={onChanged}
      />
    </div>
  )
}
