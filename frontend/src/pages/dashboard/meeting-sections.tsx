import { Link } from "react-router-dom"
import type { AttendanceSummaryRow, MeetingRow } from "@/api/types"
import { Initials, ListRow, RowList } from "@/components/list-row"
import { RemindLinks } from "@/components/remind-links"
import { SectionCard } from "@/components/section-card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { useSession } from "@/context/session-context"
import { useI18n } from "@/i18n/i18n-context"
import { formatDate, getToday } from "@/lib/format"
import { can } from "@/lib/permissions"
import { daysUntil } from "@/lib/meeting-dates"
import { MEETING_TYPE_KEYS } from "@/pages/meetings/meeting-status"
import { whenLabel } from "@/pages/meetings/when"

export function NextMeeting({ meetings }: { meetings: MeetingRow[] }) {
  const { session } = useSession()
  const { t, locale } = useI18n()
  const today = getToday()
  const next = meetings
    .filter((item) => item.meeting_date >= today)
    .sort((a, b) => a.meeting_date.localeCompare(b.meeting_date))[0]
  const title = t("dashboard.nextMeeting")

  if (!next) {
    return (
      <SectionCard title={title}>
        <p className="text-sm text-muted-foreground">
          {t("dashboard.noMeeting")}
        </p>
        {can("manageMeetings", session?.user.role) ? (
          <Button
            variant="outline"
            className="mt-4 max-sm:w-full"
            render={<Link to="/meetings" />}
            nativeButton={false}
          >
            {t("dashboard.planMeeting")}
          </Button>
        ) : null}
      </SectionCard>
    )
  }

  const when = whenLabel(t, daysUntil(next.meeting_date, today))

  return (
    <SectionCard
      title={title}
      action={<StatusBadge tone="good">{when}</StatusBadge>}
    >
      <p className="text-2xl font-semibold tracking-tight">
        {formatDate(next.meeting_date, locale)}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {next.meeting_time} · {t(MEETING_TYPE_KEYS[next.meeting_type])}
      </p>
      <Button
        variant="outline"
        className="mt-5 max-sm:w-full"
        render={<Link to={`/meetings/${next.meeting_id}`} />}
        nativeButton={false}
      >
        {t("dashboard.openMeetingFull")}
      </Button>
    </SectionCard>
  )
}

export function MissedMeetings({ rows }: { rows: AttendanceSummaryRow[] }) {
  const { t } = useI18n()

  return (
    <SectionCard title={t("dashboard.missedTitle")}>
      <RowList>
        {rows.map((row) => (
          <ListRow
            key={row.member_id}
            leading={<Initials name={row.member_name} />}
            title={row.member_name}
            subtitle={t("dashboard.missedRow", { count: row.recent_absent })}
          >
            <RemindLinks
              memberId={row.member_id}
              name={row.member_name}
              kind="reminder.missed"
            />
          </ListRow>
        ))}
      </RowList>
    </SectionCard>
  )
}
