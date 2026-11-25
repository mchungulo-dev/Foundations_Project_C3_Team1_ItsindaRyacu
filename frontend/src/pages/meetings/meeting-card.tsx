import { Link } from "react-router-dom"
import type { MeetingRow } from "@/api/types"
import { ProgressBar } from "@/components/progress-bar"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/i18n/i18n-context"
import { formatDate, getToday } from "@/lib/format"
import { daysUntil } from "@/lib/meeting-dates"
import { percentOf } from "@/lib/savings-totals"
import {
  ATTENDANCE_STATUS,
  MEETING_TYPE_KEYS,
} from "@/pages/meetings/meeting-status"
import { whenLabel } from "@/pages/meetings/when"

type MeetingCardProps = { meeting: MeetingRow; showMinutes: boolean }

export function MeetingCard({ meeting, showMinutes }: MeetingCardProps) {
  const { t, locale } = useI18n()
  const today = getToday()
  const past = meeting.meeting_date < today
  const mine = meeting.my_status ? ATTENDANCE_STATUS[meeting.my_status] : null

  return (
    <Link
      to={`/meetings/${meeting.meeting_id}`}
      className="block rounded-xl focus-visible:outline-2 focus-visible:outline-ring"
    >
      <Card className="h-full transition-colors hover:bg-muted/40">
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold">
                {formatDate(meeting.meeting_date, locale)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {meeting.meeting_time} ·{" "}
                {t(MEETING_TYPE_KEYS[meeting.meeting_type])}
              </p>
            </div>
            {past ? (
              mine && meeting.my_status ? (
                <StatusBadge tone={mine.tone}>
                  {t("meetings.mine", { status: t(mine.label) })}
                </StatusBadge>
              ) : null
            ) : (
              <StatusBadge tone="good">
                {whenLabel(t, daysUntil(meeting.meeting_date, today))}
              </StatusBadge>
            )}
          </div>
          {past ? (
            <div className="space-y-2">
              {meeting.marked > 0 ? (
                <>
                  <ProgressBar
                    value={percentOf(meeting.attended, meeting.marked)}
                    label={t("meetings.colAttendance")}
                  />
                  <p className="text-sm text-muted-foreground">
                    {t("meetings.came", {
                      attended: meeting.attended,
                      marked: meeting.marked,
                    })}
                  </p>
                </>
              ) : (
                <StatusBadge tone="warn">{t("meetings.notTaken")}</StatusBadge>
              )}
              {showMinutes && !meeting.minutes ? (
                <StatusBadge tone="warn">
                  {t("meetings.minutes")}: {t("meetings.minutesMissing")}
                </StatusBadge>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  )
}
