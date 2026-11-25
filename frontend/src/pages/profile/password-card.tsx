import { SectionCard } from "@/components/section-card"
import { useState, type FormEvent } from "react"
import { changePassword } from "@/api/profile"
import { TextField } from "@/components/text-field"
import { Button } from "@/components/ui/button"
import { apiErrorText, translateBackendMessage } from "@/i18n/api-messages"
import { useI18n } from "@/i18n/i18n-context"
import { errorDetails } from "@/lib/api"
import { isValidPassword } from "@/lib/validation"

export function PasswordCard() {
  const { t } = useI18n()
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [errors, setErrors] = useState({ current: "", next: "", confirm: "" })
  const [serverError, setServerError] = useState("")
  const [changed, setChanged] = useState(false)
  const [sending, setSending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = {
      current: current ? "" : t("validation.passwordRequired"),
      next: isValidPassword(next) ? "" : t("validation.passwordShort"),
      confirm:
        confirm === next
          ? ""
          : t(
              confirm
                ? "validation.passwordMismatch"
                : "validation.confirmRequired"
            ),
    }
    setErrors(nextErrors)
    setChanged(false)
    setServerError("")
    if (nextErrors.current || nextErrors.next || nextErrors.confirm) {
      return
    }
    setSending(true)
    try {
      await changePassword({ current, next })
      setCurrent("")
      setNext("")
      setConfirm("")
      setChanged(true)
    } catch (failure) {
      setServerError(
        [
          apiErrorText(failure, t),
          ...errorDetails(failure).map((detail) =>
            translateBackendMessage(detail, t)
          ),
        ].join(" ")
      )
    }
    setSending(false)
  }

  return (
    <SectionCard title={t("profile.passwordTitle")}>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <TextField
          id="profile-current-password"
          label={t("profile.currentPassword")}
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
          error={errors.current}
        />
        <TextField
          id="profile-new-password"
          label={t("profile.newPassword")}
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(event) => setNext(event.target.value)}
          error={errors.next}
        />
        <TextField
          id="profile-confirm-password"
          label={t("profile.confirmPassword")}
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          error={errors.confirm}
        />
        {serverError ? (
          <p role="alert" className="text-sm text-destructive">
            {serverError}
          </p>
        ) : null}
        {changed ? (
          <p role="status" className="rounded-lg bg-secondary p-4 text-sm">
            {t("profile.passwordChanged")}
          </p>
        ) : null}
        <Button type="submit" disabled={sending} className="w-full sm:w-auto">
          {t("profile.changePassword")}
        </Button>
      </form>
    </SectionCard>
  )
}
