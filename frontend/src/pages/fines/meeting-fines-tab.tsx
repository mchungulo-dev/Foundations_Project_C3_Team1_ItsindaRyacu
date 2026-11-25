import type { AttendanceEntry, Meeting } from "@/api/types"
import { FormError } from "@/components/form-error"
import { LoadingSpinner, RequestError } from "@/components/request-states"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/i18n/i18n-context"
import { formatMoney, getToday } from "@/lib/format"
import { useMeetingFines } from "@/pages/fines/use-meeting-fines"
import { ATTENDANCE_STATUS } from "@/pages/meetings/meeting-status"

type MeetingFinesTabProps = {
  meeting: Meeting
  entries: AttendanceEntry[]
}

export function MeetingFinesTab({ meeting, entries }: MeetingFinesTabProps) {
  const { t, locale } = useI18n()
  const fines = useMeetingFines(meeting)
  const rows = entries.filter(
    (entry) => entry.status === "late" || entry.status === "absent"
  )

  if (fines.error) {
    return <RequestError error={fines.error} onRetry={fines.reload} />
  }
  if (!fines.loaded) {
    return <LoadingSpinner />
  }

  let note = ""
  if (meeting.meeting_date > getToday()) {
    note = t("fines.tabLater")
  } else if (entries.length === 0) {
    note = t("fines.tabNoAttendance")
  } else if (rows.length === 0) {
    note = t("fines.tabNobody")
  } else if (!fines.fineFor("late") && !fines.fineFor("absent")) {
    note = t("fines.tabNoAmount")
  }
  if (note) {
    return (
      <Card>
        <CardContent className="text-sm text-muted-foreground">
          {note}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <FormError error={fines.failure} />
      <ul className="space-y-3">
        {rows.map((entry) => {
          const fine = fines.fineFor(entry.status)
          const { label, tone } = ATTENDANCE_STATUS[entry.status]
          return (
            <li
              key={entry.member_id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
            >
              <div className="min-w-0 space-y-1">
                <p className="truncate font-medium">{entry.member_name}</p>
                <StatusBadge tone={tone}>{t(label)}</StatusBadge>
              </div>
              {fines.isIssued(entry.member_id, entry.status) ? (
                <StatusBadge tone="good">{t("fines.tabDone")}</StatusBadge>
              ) : fine ? (
                <Button
                  size="sm"
                  disabled={fines.busy !== null}
                  onClick={() =>
                    fines.issue([
                      { memberId: entry.member_id, status: entry.status },
                    ])
                  }
                >
                  {t("fines.tabIssue", {
                    amount: formatMoney(fine.amount, locale),
                  })}
                </Button>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
