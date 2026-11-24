import { useState, type FormEvent } from "react"
import { createMeeting, MEETING_TYPES, updateMeeting } from "@/api/meetings"
import type { Meeting, MeetingType } from "@/api/types"
import { FormDialog } from "@/components/form-dialog"
import { FormError } from "@/components/form-error"
import { SelectField } from "@/components/select-field"
import { TextField } from "@/components/text-field"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { useI18n } from "@/i18n/i18n-context"
import { hasErrors, isValidDate, isValidMeetingTime } from "@/lib/validation"
import { MEETING_TYPE_KEYS } from "@/pages/meetings/meeting-status"

type MeetingFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  meeting?: Meeting
  defaults: { date: string; time: string }
  onSaved: (message: string) => void
}

export function MeetingFormDialog({
  open,
  onOpenChange,
  meeting,
  defaults,
  onSaved,
}: MeetingFormDialogProps) {
  const { t } = useI18n()

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t(meeting ? "meetings.formEdit" : "meetings.formNew")}
      description={t("meetings.formBody")}
    >
      <MeetingForm
        meeting={meeting}
        defaults={defaults}
        onCancel={() => onOpenChange(false)}
        onSaved={(message) => {
          onOpenChange(false)
          onSaved(message)
        }}
      />
    </FormDialog>
  )
}

type MeetingFormProps = {
  meeting?: Meeting
  defaults: { date: string; time: string }
  onCancel: () => void
  onSaved: (message: string) => void
}

function MeetingForm({
  meeting,
  defaults,
  onCancel,
  onSaved,
}: MeetingFormProps) {
  const { t } = useI18n()
  const [values, setValues] = useState({
    date: meeting?.meeting_date ?? defaults.date,
    time: meeting?.meeting_time ?? defaults.time,
    type: (meeting?.meeting_type ?? "regular") as MeetingType,
  })
  const [errors, setErrors] = useState({ date: "", time: "" })
  const [failure, setFailure] = useState<unknown>(null)
  const [sending, setSending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending) {
      return
    }
    const nextErrors = {
      date: isValidDate(values.date) ? "" : t("validation.meetingDateRequired"),
      time: isValidMeetingTime(values.time)
        ? ""
        : t("validation.meetingTimeInvalid"),
    }
    setErrors(nextErrors)
    setFailure(null)
    if (hasErrors(nextErrors)) {
      return
    }
    setSending(true)
    const fields = {
      meeting_date: values.date,
      meeting_time: values.time,
      meeting_type: values.type,
    }
    try {
      if (meeting) {
        await updateMeeting(meeting.meeting_id, fields)
      } else {
        await createMeeting(fields)
      }
      onSaved(t(meeting ? "meetings.updated" : "meetings.created"))
    } catch (caught) {
      setFailure(caught)
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormError error={failure} />
      <TextField
        id="meeting-date"
        label={t("meetings.date")}
        type="date"
        value={values.date}
        onChange={(event) => setValues({ ...values, date: event.target.value })}
        error={errors.date}
        disabled={sending}
      />
      <TextField
        id="meeting-time"
        label={t("meetings.time")}
        type="time"
        value={values.time}
        onChange={(event) => setValues({ ...values, time: event.target.value })}
        error={errors.time}
        disabled={sending}
      />
      <SelectField
        id="meeting-type"
        label={t("meetings.type")}
        value={values.type}
        onChange={(event) =>
          setValues({ ...values, type: event.target.value as MeetingType })
        }
        options={MEETING_TYPES.map((type) => ({
          value: type,
          label: t(MEETING_TYPE_KEYS[type]),
        }))}
        disabled={sending}
      />
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={sending}
          onClick={onCancel}
        >
          {t("action.cancel")}
        </Button>
        <Button type="submit" disabled={sending}>
          {t(sending ? "profile.saving" : "meetings.save")}
        </Button>
      </DialogFooter>
    </form>
  )
}
