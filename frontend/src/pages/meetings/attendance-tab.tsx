import { useState } from "react"
import { saveAttendance } from "@/api/meetings"
import type {
  AttendanceEntry,
  AttendanceStatus,
  Meeting,
  MemberOption,
} from "@/api/types"
import { FormError } from "@/components/form-error"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSession } from "@/context/session-context"
import { useI18n } from "@/i18n/i18n-context"
import { formatMoney, getToday } from "@/lib/format"
import { can } from "@/lib/permissions"
import { cn } from "@/lib/utils"
import { useMeetingFines } from "@/pages/fines/use-meeting-fines"
import { ATTENDANCE_STATUS } from "@/pages/meetings/meeting-status"

const STATUSES = Object.keys(ATTENDANCE_STATUS) as AttendanceStatus[]

type AttendanceTabProps = {
  meeting: Meeting
  entries: AttendanceEntry[]
  members: MemberOption[]
  canEdit: boolean
  wholeGroup: boolean
  onSaved: () => void
}

export function AttendanceTab({
  meeting,
  entries,
  members,
  canEdit,
  wholeGroup,
  onSaved,
}: AttendanceTabProps) {
  const { t } = useI18n()

  if (canEdit) {
    return (
      <AttendanceSheet
        meeting={meeting}
        entries={entries}
        members={members}
        onSaved={onSaved}
      />
    )
  }
  const statusOf = (memberId: number) =>
    entries.find((entry) => entry.member_id === memberId)?.status
  const shown = wholeGroup ? members : entries

  return (
    <Card>
      <CardContent>
        {!wholeGroup ? (
          <h2 className="mb-5 text-base font-semibold">
            {t("meetings.yourAttendance")}
          </h2>
        ) : null}
        <ul className="divide-y divide-border">
          {(shown.length === 0 ? [null] : shown).map((item) => {
            const status = item ? statusOf(item.member_id) : undefined
            const view = status ? ATTENDANCE_STATUS[status] : null
            return (
              <li
                key={item?.member_id ?? "none"}
                className="flex items-center justify-between gap-3 py-3"
              >
                <span className="truncate">
                  {wholeGroup && item ? item.member_name : ""}
                </span>
                {view ? (
                  <StatusBadge tone={view.tone}>{t(view.label)}</StatusBadge>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {t("meetings.notMarked")}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

type SheetProps = Pick<
  AttendanceTabProps,
  "meeting" | "entries" | "members" | "onSaved"
>

function AttendanceSheet({ meeting, entries, members, onSaved }: SheetProps) {
  const { t, locale } = useI18n()
  const { session } = useSession()
  const fines = useMeetingFines(meeting)
  const canFine = can("issueFine", session?.user.role)
  const [marks, setMarks] = useState<Record<number, AttendanceStatus>>(() =>
    Object.fromEntries(entries.map((entry) => [entry.member_id, entry.status]))
  )
  const [failure, setFailure] = useState<unknown>(null)
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const early = meeting.meeting_date > getToday()
  const active = members.filter((member) => member.is_active)
  const count = (status: AttendanceStatus) =>
    active.filter((member) => marks[member.member_id] === status).length
  const unmarked = active.filter((member) => !marks[member.member_id]).length
  const toFine = canFine
    ? active
        .map((member) => ({
          memberId: member.member_id,
          status: marks[member.member_id],
        }))
        .filter(
          (item) =>
            fines.fineFor(item.status) &&
            !fines.isIssued(item.memberId, item.status)
        )
    : []
  const toFineTotal = toFine.reduce(
    (sum, item) => sum + (fines.fineFor(item.status)?.amount ?? 0),
    0
  )

  async function save() {
    const records = active
      .filter((member) => marks[member.member_id])
      .map((member) => ({
        member_id: member.member_id,
        status: marks[member.member_id],
      }))
    setFailure(null)
    setMessage("")
    if (records.length === 0) {
      setMessage(t("meetings.markOne"))
      return
    }
    setSending(true)
    try {
      await saveAttendance(meeting.meeting_id, records)
      setMessage(t("meetings.attendanceSaved"))
      onSaved()
    } catch (caught) {
      setFailure(caught)
    }
    setSending(false)
  }

  if (early) {
    return (
      <Card>
        <CardContent className="text-sm text-muted-foreground">
          {t("meetings.attendanceLater")}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t("meetings.counts", {
            present: count("present"),
            late: count("late"),
            absent: count("absent"),
            excused: count("excused"),
            unmarked,
          })}
        </p>
        <Button
          variant="outline"
          disabled={sending}
          onClick={() =>
            setMarks(
              Object.fromEntries(
                active.map((member) => [member.member_id, "present"])
              )
            )
          }
        >
          {t("meetings.markAll")}
        </Button>
      </div>
      {toFine.length > 0 ? (
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          disabled={fines.busy !== null}
          onClick={() => fines.issue(toFine)}
        >
          {t("fines.inlineAll", {
            count: toFine.length,
            amount: formatMoney(toFineTotal, locale),
          })}
        </Button>
      ) : null}
      <FormError error={fines.failure} />
      <ul className="space-y-3">
        {active.map((member) => (
          <li
            key={member.member_id}
            className="space-y-2 rounded-xl border border-border bg-card p-3"
          >
            <p className="font-medium">{member.member_name}</p>
            <div
              role="group"
              aria-label={member.member_name}
              className="grid grid-cols-4 gap-2"
            >
              {STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={sending}
                  aria-pressed={marks[member.member_id] === status}
                  onClick={() =>
                    setMarks({ ...marks, [member.member_id]: status })
                  }
                  className={cn(
                    "min-h-11 rounded-lg border px-1 text-sm",
                    marks[member.member_id] === status
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-border bg-background"
                  )}
                >
                  {t(ATTENDANCE_STATUS[status].label)}
                </button>
              ))}
            </div>
            {canFine && fines.fineFor(marks[member.member_id]) ? (
              <div className="flex justify-end">
                {fines.isIssued(member.member_id, marks[member.member_id]) ? (
                  <StatusBadge tone="good">{t("fines.tabDone")}</StatusBadge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={fines.busy !== null}
                    onClick={() =>
                      fines.issue([
                        {
                          memberId: member.member_id,
                          status: marks[member.member_id],
                        },
                      ])
                    }
                  >
                    {t("fines.tabIssue", {
                      amount: formatMoney(
                        fines.fineFor(marks[member.member_id])?.amount ?? 0,
                        locale
                      ),
                    })}
                  </Button>
                )}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      <FormError error={failure} />
      <div className="flex flex-col items-end gap-2">
        {message ? (
          <p role="status" className="text-sm text-muted-foreground">
            {message}
          </p>
        ) : null}
        <Button className="max-sm:w-full" disabled={sending} onClick={save}>
          {t(sending ? "profile.saving" : "meetings.saveAttendance")}
        </Button>
      </div>
    </div>
  )
}
