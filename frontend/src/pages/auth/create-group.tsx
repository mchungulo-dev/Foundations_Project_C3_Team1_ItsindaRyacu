import { useState, type FormEvent } from "react"
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCheckLine,
} from "@remixicon/react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiErrorText, translateBackendMessage } from "@/i18n/api-messages"
import { useI18n } from "@/i18n/i18n-context"
import type { MessageKey } from "@/i18n/locales/en"
import { AuthLayout } from "@/layouts/auth-layout"
import {
  adminRegisterRequest,
  type AdminRegisterResponse,
} from "@/lib/api"
import { isRegisteredAccount } from "@/lib/register-account"
import { isValidMeetingTime } from "@/lib/validation"

const STEP_KEYS = ["createGroup.stepDetails", "createGroup.stepMeetings"] as const
// These English values are what the API receives. Only the labels are translated.
const MEETING_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const

const DAY_KEYS: Record<(typeof MEETING_DAYS)[number], MessageKey> = {
  Monday: "day.monday",
  Tuesday: "day.tuesday",
  Wednesday: "day.wednesday",
  Thursday: "day.thursday",
  Friday: "day.friday",
  Saturday: "day.saturday",
  Sunday: "day.sunday",
}

type GroupFormData = {
  groupName: string
  location: string
  savingsAmount: string
  meetingDay: string
  meetingTime: string
  startDate: string
}

const initialForm: GroupFormData = {
  groupName: "",
  location: "",
  savingsAmount: "",
  meetingDay: "",
  meetingTime: "",
  startDate: "",
}

export function CreateGroupPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useI18n()
  const account = isRegisteredAccount(location.state?.account)
    ? location.state.account
    : null

  const [step, setStep] = useState(0)
  const [form, setForm] = useState(initialForm)
  // Errors are stored as message keys so they re-translate when the language changes.
  const [errors, setErrors] = useState<
    Partial<Record<keyof GroupFormData, MessageKey | "">>
  >({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState("")
  const [success, setSuccess] = useState<AdminRegisterResponse | null>(null)

  if (!account) {
    return <Navigate to="/register" replace />
  }

  function updateField<K extends keyof GroupFormData>(
    key: K,
    value: GroupFormData[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: "" }))
    setApiError("")
  }

  function validateStep(currentStep: number) {
    const next: Partial<Record<keyof GroupFormData, MessageKey>> = {}

    if (currentStep === 0) {
      if (form.groupName.trim().length < 2) {
        next.groupName = "validation.groupNameShort"
      }
      if (!form.savingsAmount.trim()) {
        next.savingsAmount = "validation.savingsRequired"
      } else if (
        Number.isNaN(Number(form.savingsAmount)) ||
        Number(form.savingsAmount) <= 0
      ) {
        next.savingsAmount = "validation.savingsInvalid"
      }
    }

    if (currentStep === 1) {
      if (!form.meetingDay) {
        next.meetingDay = "validation.meetingDayRequired"
      }
      if (!form.meetingTime) {
        next.meetingTime = "validation.meetingTimeRequired"
      } else if (!isValidMeetingTime(form.meetingTime)) {
        next.meetingTime = "validation.meetingTimeInvalid"
      }
      if (!form.startDate) {
        next.startDate = "validation.startDateRequired"
      }
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleNext(event: FormEvent) {
    event.preventDefault()
    if (!validateStep(step)) {
      return
    }
    if (step < STEP_KEYS.length - 1) {
      setStep(step + 1)
      return
    }

    setSubmitting(true)
    setApiError("")
    try {
      const data = await adminRegisterRequest(account, {
        groupName: form.groupName,
        location: form.location,
        savingsAmount: Number(form.savingsAmount),
        meetingDay: form.meetingDay,
        meetingTime: form.meetingTime,
        startDate: form.startDate,
      })
      setSuccess(data)
    } catch (error) {
      setApiError(apiErrorText(error, t))
    } finally {
      setSubmitting(false)
    }
  }

  function handleBack() {
    setStep((current) => Math.max(0, current - 1))
  }

  const progressValue =
    success !== null
      ? 100
      : Math.round(((step + 1) / STEP_KEYS.length) * 100)

  if (success) {
    return (
      <AuthLayout>
        <div
          role="status"
          className="flex gap-3 rounded-xl border border-border bg-secondary p-4 text-sm leading-relaxed text-secondary-foreground"
        >
          <RiCheckLine className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-medium text-foreground">
              {translateBackendMessage(success.message, t)}
            </p>
            <p>
              <span className="font-medium">{success.group_name}</span>
              {t("createGroup.signInAs")}
              <span className="font-medium">{success.admin_email}</span>.
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="lg"
          className="mt-8 w-full"
          onClick={() => navigate("/login")}
        >
          {t("action.signIn")}
          <RiArrowRightLine aria-hidden="true" />
        </Button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <p className="text-sm text-muted-foreground">
        {t("createGroup.eyebrow")}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        {t("createGroup.title")}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {t("createGroup.step", {
          current: step + 1,
          total: STEP_KEYS.length,
          label: t(STEP_KEYS[step]),
        })}{" "}
        <span className="font-medium text-foreground">{account.name}</span>{" "}
        {t("createGroup.adminSuffix")}
      </p>

      <Progress
        value={progressValue}
        className="mt-6 w-full [&_[data-slot=progress-track]]:w-full"
      />

      <form onSubmit={handleNext} noValidate className="mt-8 space-y-6">
        {apiError ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {apiError}
          </p>
        ) : null}

        {step === 0 ? (
          <>
            <div className="space-y-2.5">
              <Label htmlFor="group-name">{t("createGroup.groupName")}</Label>
              <Input
                id="group-name"
                autoComplete="organization"
                placeholder="Abahujumugambi Savings Group"
                value={form.groupName}
                onChange={(event) =>
                  updateField("groupName", event.target.value)
                }
                aria-invalid={Boolean(errors.groupName)}
                aria-describedby={
                  errors.groupName ? "group-name-error" : undefined
                }
                disabled={submitting}
                required
              />
              {errors.groupName ? (
                <p
                  id="group-name-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {t(errors.groupName)}
                </p>
              ) : null}
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="group-location">{t("createGroup.location")}</Label>
              <Input
                id="group-location"
                autoComplete="address-level2"
                placeholder="Kigali, Gasabo"
                value={form.location}
                onChange={(event) =>
                  updateField("location", event.target.value)
                }
                disabled={submitting}
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="savings-amount">{t("createGroup.savings")}</Label>
              <Input
                id="savings-amount"
                type="number"
                min={1}
                inputMode="numeric"
                placeholder="10000"
                value={form.savingsAmount}
                onChange={(event) =>
                  updateField("savingsAmount", event.target.value)
                }
                aria-invalid={Boolean(errors.savingsAmount)}
                aria-describedby={
                  errors.savingsAmount ? "savings-amount-error" : undefined
                }
                disabled={submitting}
                required
              />
              {errors.savingsAmount ? (
                <p
                  id="savings-amount-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {t(errors.savingsAmount)}
                </p>
              ) : null}
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <div className="space-y-2.5">
              <Label htmlFor="meeting-day">{t("createGroup.meetingDay")}</Label>
              <Select
                value={form.meetingDay || null}
                onValueChange={(value) => updateField("meetingDay", value ?? "")}
                disabled={submitting}
              >
                <SelectTrigger
                  id="meeting-day"
                  className="w-full"
                  aria-invalid={Boolean(errors.meetingDay)}
                  aria-describedby={
                    errors.meetingDay ? "meeting-day-error" : undefined
                  }
                >
                  <SelectValue placeholder={t("createGroup.chooseDay")}>
                    {(value: string | null) =>
                      value && value in DAY_KEYS
                        ? t(DAY_KEYS[value as keyof typeof DAY_KEYS])
                        : t("createGroup.chooseDay")
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {MEETING_DAYS.map((day) => (
                    <SelectItem key={day} value={day}>
                      {t(DAY_KEYS[day])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.meetingDay ? (
                <p
                  id="meeting-day-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {t(errors.meetingDay)}
                </p>
              ) : null}
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="meeting-time">{t("createGroup.meetingTime")}</Label>
              <Input
                id="meeting-time"
                type="time"
                value={form.meetingTime}
                onChange={(event) =>
                  updateField("meetingTime", event.target.value)
                }
                aria-invalid={Boolean(errors.meetingTime)}
                aria-describedby={
                  errors.meetingTime ? "meeting-time-error" : undefined
                }
                disabled={submitting}
                required
              />
              {errors.meetingTime ? (
                <p
                  id="meeting-time-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {t(errors.meetingTime)}
                </p>
              ) : null}
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="start-date">{t("createGroup.startDate")}</Label>
              <Input
                id="start-date"
                type="date"
                value={form.startDate}
                onChange={(event) =>
                  updateField("startDate", event.target.value)
                }
                aria-invalid={Boolean(errors.startDate)}
                aria-describedby={
                  errors.startDate ? "start-date-error" : undefined
                }
                disabled={submitting}
                required
              />
              {errors.startDate ? (
                <p
                  id="start-date-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {t(errors.startDate)}
                </p>
              ) : null}
            </div>
          </>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          {step > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="sm:flex-1"
              disabled={submitting}
              onClick={handleBack}
            >
              <RiArrowLeftLine aria-hidden="true" />
              {t("createGroup.back")}
            </Button>
          ) : null}
          <Button
            type="submit"
            size="lg"
            className={step > 0 ? "sm:flex-1" : "w-full"}
            disabled={submitting}
          >
            {step === STEP_KEYS.length - 1
              ? submitting
                ? t("createGroup.submitting")
                : t("createGroup.submit")
              : t("createGroup.continue")}
            <RiArrowRightLine aria-hidden="true" />
          </Button>
        </div>
      </form>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        <Link
          to="/register"
          className="font-medium text-brand underline-offset-4 hover:underline"
        >
          {t("createGroup.backToSignUp")}
        </Link>
      </p>
    </AuthLayout>
  )
}
