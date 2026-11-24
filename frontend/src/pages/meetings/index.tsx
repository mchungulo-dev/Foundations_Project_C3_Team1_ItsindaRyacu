import { useCallback, useState } from "react"
import { RiAddLine } from "@remixicon/react"
import { getGroup } from "@/api/group"
import { getMeetings } from "@/api/meetings"
import { Notice } from "@/components/notice"
import { PillGroup } from "@/components/pill-group"
import {
  LoadingSpinner,
  RequestError,
  SampleNotice,
} from "@/components/request-states"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSession } from "@/context/session-context"
import { useRequest } from "@/hooks/use-request"
import { useI18n } from "@/i18n/i18n-context"
import { formatDate, getToday } from "@/lib/format"
import { daysUntil, nextMeetingDate } from "@/lib/meeting-dates"
import { can } from "@/lib/permissions"
import { percentOf } from "@/lib/savings-totals"
import { AttendanceSummary } from "@/pages/meetings/attendance-summary"
import { MeetingCard } from "@/pages/meetings/meeting-card"
import { MeetingFormDialog } from "@/pages/meetings/meeting-form"
import { MeetingsTable } from "@/pages/meetings/meetings-table"
import { MEETING_TYPE_KEYS } from "@/pages/meetings/meeting-status"
import { whenLabel } from "@/pages/meetings/when"

const PAGE_SIZE = 15
const RATE_WINDOW = 6

export function MeetingsPage() {
  const { session } = useSession()
  const { t, locale } = useI18n()
  const role = session?.user.role
  const wholeGroup = can("viewGroupFigures", role)
  const manage = can("manageMeetings", role)
  const [tab, setTab] = useState("list")
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [creating, setCreating] = useState(false)
  const [notice, setNotice] = useState("")
  const load = useCallback(() => Promise.all([getMeetings(), getGroup()]), [])
  const { data, error, reload } = useRequest(load)

  if (error) {
    return <RequestError error={error} onRetry={reload} />
  }
  if (!data) {
    return <LoadingSpinner />
  }
  const [meetings, group] = data
  const today = getToday()
  const upcoming = meetings
    .filter((item) => item.meeting_date >= today)
    .reverse()
  const past = meetings.filter((item) => item.meeting_date < today)
  const visiblePast = past.slice(0, limit)
  const [next] = upcoming
  const counted = past.filter((item) => item.marked > 0).slice(0, RATE_WINDOW)
  const groupRate = percentOf(
    counted.reduce((sum, item) => sum + item.attended, 0),
    counted.reduce((sum, item) => sum + item.marked, 0)
  )
  const mineCounted = past.filter((item) => item.my_status !== null)
  const mineAttended = mineCounted.filter(
    (item) => item.my_status === "present" || item.my_status === "late"
  ).length
  const todo = meetings.filter(
    (item) => item.meeting_date <= today && (item.marked === 0 || !item.minutes)
  ).length

  return (
    <div className="space-y-6">
      <SampleNotice />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("meetings.title")}
        </h1>
        {manage ? (
          <Button
            className="w-full sm:w-auto"
            onClick={() => setCreating(true)}
          >
            <RiAddLine aria-hidden="true" />
            {t("meetings.new")}
          </Button>
        ) : null}
      </div>
      {notice ? (
        <Notice message={notice} onClose={() => setNotice("")} />
      ) : null}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
        {next ? (
          <StatCard
            highlight
            className="col-span-2 xl:col-span-1"
            label={t("dashboard.nextMeeting")}
            value={formatDate(next.meeting_date, locale)}
            unit={whenLabel(t, daysUntil(next.meeting_date, today))}
            note={`${next.meeting_time} · ${t(MEETING_TYPE_KEYS[next.meeting_type])}`}
            action={{
              to: `/meetings/${next.meeting_id}`,
              label: t("dashboard.openMeetingFull"),
            }}
          />
        ) : (
          <StatCard
            highlight
            className="col-span-2 xl:col-span-1"
            label={t("dashboard.nextMeeting")}
            value={t("dashboard.noMeeting")}
            action={
              manage
                ? {
                    label: t("meetings.new"),
                    onClick: () => setCreating(true),
                  }
                : undefined
            }
          />
        )}
        {wholeGroup ? (
          <StatCard
            label={t("meetings.rate")}
            value={counted.length > 0 ? `${groupRate}%` : "–"}
            note={t("meetings.rateNote", { count: counted.length })}
          />
        ) : (
          <StatCard
            label={t("meetings.myRate")}
            value={
              mineCounted.length > 0
                ? `${percentOf(mineAttended, mineCounted.length)}%`
                : "–"
            }
            unit={t("meetings.myRateNote", {
              attended: mineAttended,
              total: mineCounted.length,
            })}
          />
        )}
        {manage ? (
          <StatCard
            label={t("meetings.todo")}
            value={String(todo)}
            note={t(todo > 0 ? "meetings.todoNote" : "meetings.todoNone")}
          />
        ) : null}
      </div>
      {wholeGroup ? (
        <PillGroup
          label={t("meetings.title")}
          value={tab}
          onChange={setTab}
          items={[
            { value: "list", label: t("meetings.tabList") },
            { value: "members", label: t("meetings.tabMembers") },
          ]}
        />
      ) : null}
      {tab === "members" && wholeGroup ? (
        <AttendanceSummary />
      ) : (
        <>
          {upcoming.length + past.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                {t("meetings.none")}
              </CardContent>
            </Card>
          ) : wholeGroup ? (
            <MeetingsTable upcoming={upcoming} past={visiblePast} />
          ) : null}
          <div className={wholeGroup ? "space-y-6 md:hidden" : "space-y-6"}>
            {upcoming.length > 0 ? (
              <section className="space-y-3">
                <h2 className="text-base font-semibold">
                  {t("meetings.groupUpcoming")}
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {upcoming.map((item) => (
                    <MeetingCard
                      key={item.meeting_id}
                      meeting={item}
                      showMinutes={manage}
                    />
                  ))}
                </div>
              </section>
            ) : null}
            {visiblePast.length > 0 ? (
              <section className="space-y-3">
                <h2 className="text-base font-semibold">
                  {t("meetings.past")}
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {visiblePast.map((item) => (
                    <MeetingCard
                      key={item.meeting_id}
                      meeting={item}
                      showMinutes={manage}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
          {past.length > limit ? (
            <Button
              variant="outline"
              className="w-full sm:mx-auto sm:flex sm:w-auto"
              onClick={() => setLimit(limit + PAGE_SIZE)}
            >
              {t("savings.showMore")}
            </Button>
          ) : null}
        </>
      )}
      {!wholeGroup ? <AttendanceSummary /> : null}
      <MeetingFormDialog
        open={creating}
        onOpenChange={setCreating}
        defaults={{
          date: nextMeetingDate(group.meeting_day, today),
          time: group.meeting_time ?? "16:00",
        }}
        onSaved={(message) => {
          setNotice(message)
          reload()
        }}
      />
    </div>
  )
}
