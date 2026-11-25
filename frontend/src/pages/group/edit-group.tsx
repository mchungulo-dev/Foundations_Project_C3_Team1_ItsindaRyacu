import { useState, type FormEvent } from "react"
import { updateGroup } from "@/api/group"
import type { Group } from "@/api/types"
import { FormDialog } from "@/components/form-dialog"
import { FormError } from "@/components/form-error"
import { SelectField } from "@/components/select-field"
import { TextField } from "@/components/text-field"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { useI18n } from "@/i18n/i18n-context"
import { DAY_KEYS, MEETING_DAYS } from "@/lib/meeting-days"
import {
  digitsOnly,
  hasErrors,
  isValidAmount,
  isValidFine,
  isValidMeetingTime,
} from "@/lib/validation"

type EditGroupDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: Group
  onSaved: () => void
}

export function EditGroupDialog({
  open,
  onOpenChange,
  group,
  onSaved,
}: EditGroupDialogProps) {
  const { t } = useI18n()

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("group.editTitle")}
    >
      <EditGroupForm
        group={group}
        onCancel={() => onOpenChange(false)}
        onSaved={() => {
          onOpenChange(false)
          onSaved()
        }}
      />
    </FormDialog>
  )
}

type EditGroupFormProps = {
  group: Group
  onCancel: () => void
  onSaved: () => void
}

function EditGroupForm({ group, onCancel, onSaved }: EditGroupFormProps) {
  const { t } = useI18n()
  const [values, setValues] = useState({
    name: group.group_name,
    location: group.location ?? "",
    savings: String(group.savings_amount),
    day: group.meeting_day ?? "",
    time: group.meeting_time ?? "",
    lateFine: group.late_fine_amount ? String(group.late_fine_amount) : "",
    absentFine: group.absent_fine_amount
      ? String(group.absent_fine_amount)
      : "",
  })
  const [errors, setErrors] = useState<Record<keyof typeof values, string>>({
    name: "",
    location: "",
    savings: "",
    day: "",
    time: "",
    lateFine: "",
    absentFine: "",
  })
  const [failure, setFailure] = useState<unknown>(null)
  const [sending, setSending] = useState(false)

  function setValue(field: keyof typeof values, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = {
      name:
        values.name.trim().length >= 2 ? "" : t("validation.groupNameShort"),
      location: "",
      savings: isValidAmount(values.savings)
        ? ""
        : t("validation.savingsInvalid"),
      day: values.day ? "" : t("validation.meetingDayRequired"),
      time: isValidMeetingTime(values.time)
        ? ""
        : t("validation.meetingTimeInvalid"),
      lateFine: isValidFine(values.lateFine) ? "" : t("validation.fineInvalid"),
      absentFine: isValidFine(values.absentFine)
        ? ""
        : t("validation.fineInvalid"),
    }
    setErrors(nextErrors)
    setFailure(null)
    if (hasErrors(nextErrors)) {
      return
    }
    setSending(true)
    try {
      await updateGroup({
        group_name: values.name.trim(),
        location: values.location.trim(),
        meeting_day: values.day,
        meeting_time: values.time,
        savings_amount: Number(values.savings),
        late_fine_amount: Number(values.lateFine || 0),
        absent_fine_amount: Number(values.absentFine || 0),
      })
      onSaved()
    } catch (caught) {
      setFailure(caught)
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormError error={failure} />
      <TextField
        id="group-name"
        label={t("createGroup.groupName")}
        value={values.name}
        onChange={(event) => setValue("name", event.target.value)}
        error={errors.name}
        disabled={sending}
      />
      <TextField
        id="group-location"
        label={t("createGroup.location")}
        value={values.location}
        onChange={(event) => setValue("location", event.target.value)}
        disabled={sending}
      />
      <TextField
        id="group-savings"
        label={t("createGroup.savings")}
        inputMode="numeric"
        value={values.savings}
        onChange={(event) =>
          setValue("savings", digitsOnly(event.target.value))
        }
        error={errors.savings}
        disabled={sending}
      />
      <SelectField
        id="group-day"
        label={t("createGroup.meetingDay")}
        value={values.day}
        onChange={(event) => setValue("day", event.target.value)}
        options={[
          { value: "", label: t("createGroup.chooseDay") },
          ...MEETING_DAYS.map((day) => ({
            value: day,
            label: t(DAY_KEYS[day]),
          })),
        ]}
        error={errors.day}
        disabled={sending}
      />
      <TextField
        id="group-time"
        label={t("createGroup.meetingTime")}
        type="time"
        value={values.time}
        onChange={(event) => setValue("time", event.target.value)}
        error={errors.time}
        disabled={sending}
      />
      <TextField
        id="group-late-fine"
        label={t("group.lateFine")}
        inputMode="numeric"
        value={values.lateFine}
        onChange={(event) =>
          setValue("lateFine", digitsOnly(event.target.value))
        }
        error={errors.lateFine}
        disabled={sending}
      />
      <TextField
        id="group-absent-fine"
        label={t("group.absentFine")}
        inputMode="numeric"
        value={values.absentFine}
        onChange={(event) =>
          setValue("absentFine", digitsOnly(event.target.value))
        }
        error={errors.absentFine}
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
          {t(sending ? "profile.saving" : "profile.save")}
        </Button>
      </DialogFooter>
    </form>
  )
}
