import { useState, type FormEvent } from "react"
import { RiArrowRightLine } from "@remixicon/react"
import { Link, useNavigate } from "react-router-dom"
import { redeemInvitation } from "@/api/invitations"
import { FormError } from "@/components/form-error"
import { TextField } from "@/components/text-field"
import { Button } from "@/components/ui/button"
import { useSession } from "@/context/session-context"
import { AuthLayout } from "@/layouts/auth-layout"
import { useI18n } from "@/i18n/i18n-context"
import { applyLoginSuccess, loginRequest } from "@/lib/api"
import { hasErrors, isValidEmail } from "@/lib/validation"

// A member already has an account and a password (the admin set it). The code
// only gives them a role, so they sign in first and then use their own code.
export function JoinPage() {
  const navigate = useNavigate()
  const { setLoginSession, clearSession } = useSession()
  const { t } = useI18n()
  const [values, setValues] = useState({ email: "", password: "", code: "" })
  const [errors, setErrors] = useState({ email: "", password: "", code: "" })
  const [failure, setFailure] = useState<unknown>(null)
  const [sending, setSending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending) {
      return
    }
    const nextErrors = {
      email: isValidEmail(values.email) ? "" : t("validation.emailInvalid"),
      password: values.password ? "" : t("validation.passwordRequired"),
      code: values.code.trim() ? "" : t("join.codeRequired"),
    }
    setErrors(nextErrors)
    setFailure(null)
    if (hasErrors(nextErrors)) {
      return
    }
    setSending(true)
    try {
      const data = await loginRequest(values.email, values.password)
      applyLoginSuccess(data)
      setLoginSession(data)
      await redeemInvitation({ code: values.code })
      // The role changed, so sign in again to pick it up.
      clearSession()
      navigate("/login", {
        replace: true,
        state: { joined: true, email: values.email },
      })
    } catch (caught) {
      clearSession()
      setFailure(caught)
      setSending(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {t("join.title")}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">{t("join.body")}</p>
      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
        <FormError error={failure} />
        <TextField
          id="join-email"
          label={t("login.email")}
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) =>
            setValues({ ...values, email: event.target.value })
          }
          error={errors.email}
          disabled={sending}
        />
        <TextField
          id="join-password"
          label={t("login.password")}
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={(event) =>
            setValues({ ...values, password: event.target.value })
          }
          error={errors.password}
          disabled={sending}
        />
        <TextField
          id="join-code"
          label={t("join.code")}
          autoCapitalize="characters"
          autoComplete="off"
          className="font-mono tracking-widest uppercase"
          value={values.code}
          onChange={(event) =>
            setValues({ ...values, code: event.target.value })
          }
          error={errors.code}
          disabled={sending}
        />
        <Button type="submit" size="lg" className="w-full" disabled={sending}>
          {t(sending ? "join.submitting" : "join.submit")}
          <RiArrowRightLine aria-hidden="true" />
        </Button>
      </form>
      <p className="mt-7 text-center text-sm">
        <Link
          to="/login"
          className="font-medium text-brand underline-offset-4 hover:underline"
        >
          {t("join.back")}
        </Link>
      </p>
    </AuthLayout>
  )
}
