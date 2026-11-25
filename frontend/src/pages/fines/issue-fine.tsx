import { useState, type FormEvent } from "react"
import { issueFine } from "@/api/fines"
import type { Group, MeetingRow, MemberOption } from "@/api/types"
import { FormDialog } from "@/components/form-dialog"
import { FormError } from "@/components/form-error"
import { SelectField } from "@/components/select-field"
import { TextField } from "@/components/text-field"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { useI18n } from "@/i18n/i18n-context"
import { formatDate, formatMoney, getToday } from "@/lib/format"
import { digitsOnly, hasErrors, isValidAmount } from "@/lib/validation"

type IssueFineDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: MemberOption[]
  meetings: MeetingRow[]
  group: Group
  onIssued: () => void
}

export function IssueFineDialog({
  open,
  onOpenChange,
  ...form
}: IssueFineDialogProps) {
  const { t } = useI18n()

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("fines.issue")}
      description={t("fines.issueBody")}
    >
      <IssueFineForm
        {...form}
        onCancel={() => onOpenChange(false)}
        onIssued={() => {
          onOpenChange(false)
          form.onIssued()
        }}
      />
    </FormDialog>
  )
}

function IssueFineForm({
  members,
  meetings,
  group,
  onCancel,
  onIssued,
}: Omit<IssueFineDialogProps, "open" | "onOpenChange"> & {
  onCancel: () => void
}) {
  const { t, locale } = useI18n()
  const [values, setValues] = useState({
    member: "",
    meeting: "",
    amount: "",
    reason: "",
  })
  const [errors, setErrors] = useState({ member: "", amount: "", reason: "" })
  const [failure, setFailure] = useState<unknown>(null)
  const [sending, setSending] = useState(false)
  const today = getToday()
  const held = meetings.filter((item) => item.meeting_date <= today)

  function change(patch: Partial<typeof values>) {
    setValues((previous) => ({ ...previous, ...patch }))
  }

  function reasonFor(key: "fines.reasonLate" | "fines.reasonAbsent") {
    const meeting = held.find(
      (item) => String(item.meeting_id) === values.meeting
    )
    return meeting
      ? t(key, { date: formatDate(meeting.meeting_date, locale) })
      : t(key, { date: formatDate(today, locale) })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending) {
      return
    }
    const nextErrors = {
      member: values.member ? "" : t("validation.memberChoose"),
      amount: isValidAmount(values.amount) ? "" : t("validation.amountInvalid"),
      reason: values.reason.trim() ? "" : t("fines.reasonRequired"),
    }
    setErrors(nextErrors)
    setFailure(null)
    if (hasErrors(nextErrors)) {
      return
    }
    setSending(true)
    try {
      await issueFine({
        member_id: Number(values.member),
        fine_amount: Number(values.amount),
        reason: values.reason,
        meeting_id: values.meeting ? Number(values.meeting) : null,
      })
      onIssued()
    } catch (caught) {
      setFailure(caught)
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormError error={failure} />
      <SelectField
        id="fine-member"
        label={t("fines.member")}
        value={values.member}
        onChange={(event) => change({ member: event.target.value })}
        options={[
          { value: "", label: t("fines.chooseMember") },
          ...members
            .filter((item) => item.is_active)
            .map((item) => ({
              value: String(item.member_id),
              label: item.member_name,
            })),
        ]}
        error={errors.member}
        disabled={sending}
      />
      <SelectField
        id="fine-meeting"
        label={t("fines.meeting")}
        value={values.meeting}
        onChange={(event) => change({ meeting: event.target.value })}
        options={[
          { value: "", label: t("fines.noMeeting") },
          ...held.map((item) => ({
            value: String(item.meeting_id),
            label: formatDate(item.meeting_date, locale),
          })),
        ]}
        disabled={sending}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          disabled={sending}
          onClick={() =>
            change({
              amount: String(group.late_fine_amount),
              reason: reasonFor("fines.reasonLate"),
            })
          }
        >
          {t("fines.quickLate", {
            amount: formatMoney(group.late_fine_amount, locale),
          })}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={sending}
          onClick={() =>
            change({
              amount: String(group.absent_fine_amount),
              reason: reasonFor("fines.reasonAbsent"),
            })
          }
        >
          {t("fines.quickAbsent", {
            amount: formatMoney(group.absent_fine_amount, locale),
          })}
        </Button>
      </div>
      <TextField
        id="fine-amount"
        label={t("fines.amount")}
        inputMode="numeric"
        value={values.amount}
        onChange={(event) => change({ amount: digitsOnly(event.target.value) })}
        error={errors.amount}
        disabled={sending}
      />
      <TextField
        id="fine-reason"
        label={t("fines.reason")}
        maxLength={200}
        value={values.reason}
        onChange={(event) => change({ reason: event.target.value })}
        error={errors.reason}
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
          {t(sending ? "profile.saving" : "fines.save")}
        </Button>
      </DialogFooter>
    </form>
  )
}
