import { useCallback, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { RiArrowLeftLine } from "@remixicon/react"
import { getMeeting } from "@/api/meetings"
import { getMemberPicker } from "@/api/members"
import { LoadingSpinner, RequestError } from "@/components/request-states"
import { PillGroup } from "@/components/pill-group"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { useSession } from "@/context/session-context"
import { useRequest } from "@/hooks/use-request"
import { useI18n } from "@/i18n/i18n-context"
import { ApiError } from "@/lib/api"
import { formatDate, getToday } from "@/lib/format"
import type { MessageKey } from "@/i18n/locales/en"
import { can } from "@/lib/permissions"
import { AttendanceTab } from "@/pages/meetings/attendance-tab"
import { MeetingFormDialog } from "@/pages/meetings/meeting-form"
import { daysUntil } from "@/lib/meeting-dates"
import { whenLabel } from "@/pages/meetings/when"
import { MEETING_TYPE_KEYS } from "@/pages/meetings/meeting-status"
import { MeetingFinesTab } from "@/pages/fines/meeting-fines-tab"
import { MinutesTab } from "@/pages/meetings/minutes-tab"

type Tab = "attendance" | "minutes" | "fines"

const TAB_LABELS: Record<Tab, MessageKey> = {
  attendance: "meetings.tabAttendance",
  minutes: "meetings.tabMinutes",
  fines: "fines.tab",
}

function BackLink() {
  const { t } = useI18n()

  return (
    <Link
      to="/meetings"
      className="inline-flex min-h-11 items-center gap-2 text-sm text-brand"
    >
      <RiArrowLeftLine className="size-4" aria-hidden="true" />
      {t("meetings.back")}
    </Link>
  )
}

export function MeetingDetailsPage() {
  const { meetingId = "" } = useParams()
  const { session } = useSession()
  const { t, locale } = useI18n()
  const role = session?.user.role
  const wholeGroup = can("viewGroupFigures", role)
  const canEdit = can("manageMeetings", role)
  const canFine = can("issueFine", role)
  const [tab, setTab] = useState<Tab>("attendance")
  const [editing, setEditing] = useState(false)
  const load = useCallback(async () => {
    const found = await getMeeting(Number(meetingId))
    return { ...found, members: wholeGroup ? await getMemberPicker() : [] }
  }, [meetingId, wholeGroup])
  const { data, error, reload } = useRequest(load)

  if (error instanceof ApiError && error.status === 404) {
    return (
      <div className="space-y-4">
        <BackLink />
        <h1 className="text-3xl font-semibold">{t("meetings.notFound")}</h1>
      </div>
    )
  }
  if (error) {
    return (
      <div className="space-y-4">
        <BackLink />
        <RequestError error={error} onRetry={reload} />
      </div>
    )
  }
  if (!data || data.meeting.meeting_id !== Number(meetingId)) {
    return (
      <div className="space-y-4">
        <BackLink />
        <LoadingSpinner />
      </div>
    )
  }
  const { meeting, attendance, members } = data
  const started = meeting.meeting_date <= getToday()

  return (
    <div className="space-y-6">
      <BackLink />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {formatDate(meeting.meeting_date, locale)}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {meeting.meeting_time}
            <StatusBadge tone="good">
              {t(MEETING_TYPE_KEYS[meeting.meeting_type])}
            </StatusBadge>
            {!started ? (
              <StatusBadge tone="warn">
                {whenLabel(t, daysUntil(meeting.meeting_date, getToday()))}
              </StatusBadge>
            ) : null}
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {(can("recordSavings", role) || canEdit) && started ? (
            <Button
              render={
                <Link to={`/savings/record?meeting=${meeting.meeting_id}`} />
              }
              nativeButton={false}
            >
              {t("rec.title")}
            </Button>
          ) : null}
          {canEdit ? (
            <Button variant="outline" onClick={() => setEditing(true)}>
              {t("meetings.edit")}
            </Button>
          ) : null}
        </div>
      </div>
      <PillGroup
        label={t("meetings.title")}
        value={tab}
        onChange={(value) => setTab(value as Tab)}
        items={(canFine
          ? (["attendance", "minutes", "fines"] as Tab[])
          : (["attendance", "minutes"] as Tab[])
        ).map((item) => ({ value: item, label: t(TAB_LABELS[item]) }))}
      />
      {tab === "attendance" ? (
        <AttendanceTab
          meeting={meeting}
          entries={attendance}
          members={members}
          canEdit={canEdit}
          wholeGroup={wholeGroup}
          onSaved={reload}
        />
      ) : tab === "minutes" ? (
        <MinutesTab meeting={meeting} canEdit={canEdit} onSaved={reload} />
      ) : (
        <MeetingFinesTab meeting={meeting} entries={attendance} />
      )}
      <MeetingFormDialog
        open={editing}
        onOpenChange={setEditing}
        meeting={meeting}
        defaults={{ date: meeting.meeting_date, time: meeting.meeting_time }}
        onSaved={reload}
      />
    </div>
  )
}
