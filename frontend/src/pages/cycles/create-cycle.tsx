import { useState, type FormEvent } from "react"
import { createCycle } from "@/api/cycles"
import { FormDialog } from "@/components/form-dialog"
import { FormError } from "@/components/form-error"
import { TextField } from "@/components/text-field"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { useI18n } from "@/i18n/i18n-context"
import { oneYearFrom } from "@/lib/cycle-dates"
import { getToday } from "@/lib/format"
import {
  digitsOnly,
  hasErrors,
  isEndAfterStart,
  isValidAmount,
  isValidDate,
  isValidRate,
} from "@/lib/validation"

type CreateCycleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultAmount: number
  onCreated: () => void
}

export function CreateCycleDialog({
  open,
  onOpenChange,
  defaultAmount,
  onCreated,
}: CreateCycleDialogProps) {
  const { t } = useI18n()

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("cycles.startTitle")}
      description={t("cycles.startBody")}
    >
      <CreateCycleForm
        defaultAmount={defaultAmount}
        onCancel={() => onOpenChange(false)}
        onCreated={() => {
          onOpenChange(false)
          onCreated()
        }}
      />
    </FormDialog>
  )
}

type CreateCycleFormProps = {
  defaultAmount: number
  onCancel: () => void
  onCreated: () => void
}

function CreateCycleForm({
  defaultAmount,
  onCancel,
  onCreated,
}: CreateCycleFormProps) {
  const { t } = useI18n()
  const today = getToday()
  const [values, setValues] = useState({
    start: today,
    end: oneYearFrom(today),
    amount: String(defaultAmount),
    rate: "",
  })
  const [errors, setErrors] = useState({
    start: "",
    end: "",
    amount: "",
    rate: "",
  })
  const [failure, setFailure] = useState<unknown>(null)
  const [sending, setSending] = useState(false)

  function setValue(field: keyof typeof values, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = {
      start: isValidDate(values.start) ? "" : t("validation.startDateRequired"),
      end: isEndAfterStart(values.start, values.end)
        ? ""
        : t("validation.endDateRequired"),
      amount: isValidAmount(values.amount) ? "" : t("validation.amountInvalid"),
      rate: isValidRate(values.rate) ? "" : t("validation.rateInvalid"),
    }
    setErrors(nextErrors)
    setFailure(null)
    if (hasErrors(nextErrors)) {
      return
    }
    setSending(true)
    try {
      await createCycle({
        start_date: values.start,
        end_date: values.end,
        contribution_amount: Number(values.amount),
        default_interest_rate: Number(values.rate),
      })
      onCreated()
    } catch (caught) {
      setFailure(caught)
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormError error={failure} />
      <TextField
        id="cycle-start"
        label={t("cycles.startDate")}
        type="date"
        value={values.start}
        onChange={(event) => setValue("start", event.target.value)}
        error={errors.start}
        disabled={sending}
      />
      <TextField
        id="cycle-end"
        label={t("cycles.endDate")}
        type="date"
        value={values.end}
        onChange={(event) => setValue("end", event.target.value)}
        error={errors.end}
        disabled={sending}
      />
      <TextField
        id="cycle-amount"
        label={t("cycles.amount")}
        inputMode="numeric"
        value={values.amount}
        onChange={(event) => setValue("amount", digitsOnly(event.target.value))}
        error={errors.amount}
        disabled={sending}
      />
      <TextField
        id="cycle-rate"
        label={t("cycles.rate")}
        inputMode="decimal"
        placeholder="5"
        value={values.rate}
        onChange={(event) =>
          setValue("rate", event.target.value.replace(/[^\d.]/g, ""))
        }
        error={errors.rate}
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
          {t(sending ? "cycles.creating" : "cycles.create")}
        </Button>
      </DialogFooter>
    </form>
  )
}
