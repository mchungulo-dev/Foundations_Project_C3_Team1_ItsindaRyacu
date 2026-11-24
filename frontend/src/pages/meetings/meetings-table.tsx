import { Fragment } from "react"
import { Link } from "react-router-dom"
import type { MeetingRow } from "@/api/types"
import { ProgressBar } from "@/components/progress-bar"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useI18n } from "@/i18n/i18n-context"
import { formatDate, getToday } from "@/lib/format"
import { daysUntil } from "@/lib/meeting-dates"
import { percentOf } from "@/lib/savings-totals"
import { MEETING_TYPE_KEYS } from "@/pages/meetings/meeting-status"
import { whenLabel } from "@/pages/meetings/when"

type MeetingsTableProps = { upcoming: MeetingRow[]; past: MeetingRow[] }

export function MeetingsTable({ upcoming, past }: MeetingsTableProps) {
  const { t, locale } = useI18n()
  const today = getToday()
  const groups = [
    { key: "upcoming", label: t("meetings.groupUpcoming"), rows: upcoming },
    { key: "past", label: t("meetings.past"), rows: past },
  ].filter((group) => group.rows.length > 0)

  return (
    <Card className="hidden py-0 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">{t("meetings.colDate")}</TableHead>
            <TableHead scope="col">{t("meetings.colType")}</TableHead>
            <TableHead scope="col">{t("meetings.colAttendance")}</TableHead>
            <TableHead scope="col">{t("meetings.minutes")}</TableHead>
            <TableHead scope="col">
              <span className="sr-only">{t("savings.colActions")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <Fragment key={group.key}>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableCell colSpan={5} className="h-11 py-2 font-semibold">
                  {group.label}
                </TableCell>
              </TableRow>
              {group.rows.map((meeting) => {
                const isPast = meeting.meeting_date < today
                return (
                  <TableRow key={meeting.meeting_id}>
                    <TableCell>
                      <Link
                        to={`/meetings/${meeting.meeting_id}`}
                        className="font-medium hover:underline hover:underline-offset-4"
                      >
                        {formatDate(meeting.meeting_date, locale)}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {isPast
                          ? meeting.meeting_time
                          : `${meeting.meeting_time} · ${whenLabel(t, daysUntil(meeting.meeting_date, today))}`}
                      </p>
                    </TableCell>
                    <TableCell>
                      {t(MEETING_TYPE_KEYS[meeting.meeting_type])}
                    </TableCell>
                    <TableCell>
                      {!isPast ? (
                        <span className="text-muted-foreground">–</span>
                      ) : meeting.marked > 0 ? (
                        <div className="flex w-44 items-center gap-3">
                          <div className="flex-1">
                            <ProgressBar
                              value={percentOf(
                                meeting.attended,
                                meeting.marked
                              )}
                              label={t("meetings.colAttendance")}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground tabular-nums">
                            {meeting.attended}/{meeting.marked}
                          </span>
                        </div>
                      ) : (
                        <StatusBadge tone="warn">
                          {t("meetings.notTaken")}
                        </StatusBadge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!isPast ? (
                        <span className="text-muted-foreground">–</span>
                      ) : meeting.minutes ? (
                        <StatusBadge tone="good">
                          {t("meetings.minutesWritten")}
                        </StatusBadge>
                      ) : (
                        <StatusBadge tone="warn">
                          {t("meetings.minutesMissing")}
                        </StatusBadge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          render={
                            <Link to={`/meetings/${meeting.meeting_id}`} />
                          }
                          nativeButton={false}
                        >
                          {t("dashboard.openMeetingFull")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
