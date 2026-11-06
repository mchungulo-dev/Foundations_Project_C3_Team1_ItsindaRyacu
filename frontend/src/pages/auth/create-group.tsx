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
import { AuthLayout } from "@/layouts/auth-layout"
import { isRegisteredAccount } from "@/lib/register-account"
import { isValidMeetingTime } from "@/lib/validation"

const STEPS = ["Group details", "Meetings"] as const
const MEETING_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const

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
  const account = isRegisteredAccount(location.state?.account)
    ? location.state.account
    : null

  const [step, setStep] = useState(0)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof GroupFormData, string>>>(
    {}
  )
  const [completed, setCompleted] = useState(false)

  if (!account) {
    return <Navigate to="/register" replace />
  }

  function updateField<K extends keyof GroupFormData>(
    key: K,
    value: GroupFormData[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: "" }))
  }

  function validateStep(currentStep: number) {
    const next: Partial<Record<keyof GroupFormData, string>> = {}

    if (currentStep === 0) {
      if (form.groupName.trim().length < 2) {
        next.groupName = "Enter your group name (at least 2 characters)."
      }
      if (!form.savingsAmount.trim()) {
        next.savingsAmount = "Enter the monthly savings amount."
      } else if (
        Number.isNaN(Number(form.savingsAmount)) ||
        Number(form.savingsAmount) <= 0
      ) {
        next.savingsAmount = "Enter a valid amount in RWF."
      }
    }

    if (currentStep === 1) {
      if (!form.meetingDay) {
        next.meetingDay = "Choose a meeting day."
      }
      if (!form.meetingTime) {
        next.meetingTime = "Choose a meeting time."
      } else if (!isValidMeetingTime(form.meetingTime)) {
        next.meetingTime = "Use a 24-hour time, e.g. 16:00."
      }
      if (!form.startDate) {
        next.startDate = "Choose a start date."
      }
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleNext(event: FormEvent) {
    event.preventDefault()
    if (!validateStep(step)) {
      return
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1)
      return
    }
    setCompleted(true)
  }

  function handleBack() {
    setStep((current) => Math.max(0, current - 1))
  }

  const progressValue = completed
    ? 100
    : Math.round(((step + 1) / STEPS.length) * 100)

  if (completed) {
    return (
      <AuthLayout>
        <div
          role="status"
          className="flex gap-3 rounded-xl border border-border bg-secondary p-4 text-sm leading-relaxed text-secondary-foreground"
        >
          <RiCheckLine className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-medium text-foreground">
              {form.groupName.trim()} is ready to go.
            </p>
            <p>
              You will sign in as group admin with{" "}
              <span className="font-medium">{account.email}</span>.
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="lg"
          className="mt-8 w-full"
          onClick={() => navigate("/login")}
        >
          Sign in
          <RiArrowRightLine aria-hidden="true" />
        </Button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <p className="text-sm text-muted-foreground">Start a savings group</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        Create your group
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Step {step + 1} of {STEPS.length} · {STEPS[step]}. Signed in as{" "}
        <span className="font-medium text-foreground">{account.name}</span>, group
        admin.
      </p>

      <Progress
        value={progressValue}
        className="mt-6 w-full [&_[data-slot=progress-track]]:w-full"
      />

      <form onSubmit={handleNext} noValidate className="mt-8 space-y-6">
        {step === 0 ? (
          <>
            <div className="space-y-2.5">
              <Label htmlFor="group-name">Group name</Label>
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
                required
              />
              {errors.groupName ? (
                <p
                  id="group-name-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {errors.groupName}
                </p>
              ) : null}
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="group-location">Location (optional)</Label>
              <Input
                id="group-location"
                autoComplete="address-level2"
                placeholder="Kigali, Gasabo"
                value={form.location}
                onChange={(event) =>
                  updateField("location", event.target.value)
                }
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="savings-amount">Monthly savings (RWF)</Label>
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
                required
              />
              {errors.savingsAmount ? (
                <p
                  id="savings-amount-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {errors.savingsAmount}
                </p>
              ) : null}
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <div className="space-y-2.5">
              <Label htmlFor="meeting-day">Meeting day</Label>
              <Select
                value={form.meetingDay || null}
                onValueChange={(value) => updateField("meetingDay", value ?? "")}
              >
                <SelectTrigger
                  id="meeting-day"
                  className="w-full"
                  aria-invalid={Boolean(errors.meetingDay)}
                  aria-describedby={
                    errors.meetingDay ? "meeting-day-error" : undefined
                  }
                >
                  <SelectValue placeholder="Choose a day" />
                </SelectTrigger>
                <SelectContent>
                  {MEETING_DAYS.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
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
                  {errors.meetingDay}
                </p>
              ) : null}
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="meeting-time">Meeting time</Label>
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
                required
              />
              {errors.meetingTime ? (
                <p
                  id="meeting-time-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {errors.meetingTime}
                </p>
              ) : null}
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="start-date">Start date</Label>
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
                required
              />
              {errors.startDate ? (
                <p
                  id="start-date-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {errors.startDate}
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
              onClick={handleBack}
            >
              <RiArrowLeftLine aria-hidden="true" />
              Back
            </Button>
          ) : null}
          <Button
            type="submit"
            size="lg"
            className={step > 0 ? "sm:flex-1" : "w-full"}
          >
            {step === STEPS.length - 1 ? "Create group" : "Continue"}
            <RiArrowRightLine aria-hidden="true" />
          </Button>
        </div>
      </form>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        <Link
          to="/register"
          className="font-medium text-brand underline-offset-4 hover:underline"
        >
          Back to sign up
        </Link>
      </p>
    </AuthLayout>
  )
}
