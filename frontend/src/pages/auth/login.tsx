import { useState, type FormEvent } from "react"
import { RiArrowRightLine, RiEyeLine, RiEyeOffLine } from "@remixicon/react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/layouts/auth-layout"
import { useSession } from "@/context/session-context"
import { apiErrorText } from "@/i18n/api-messages"
import { useI18n } from "@/i18n/i18n-context"
import type { MessageKey } from "@/i18n/locales/en"
import { applyLoginSuccess, loginRequest } from "@/lib/api"
import { isValidEmail } from "@/lib/validation"

function destinationFromLogin(redirectTo: string | undefined): string {
  if (redirectTo === "/admin" || redirectTo === "/member") {
    return "/dashboard"
  }
  return redirectTo ?? "/dashboard"
}

function isSafeInternalPath(path: unknown): path is string {
  return (
    typeof path === "string" &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.includes("..")
  )
}

type LoginErrors = { email: MessageKey | ""; password: MessageKey | "" }

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setLoginSession } = useSession()
  const { t } = useI18n()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  // Errors are stored as message keys so they re-translate when the language changes.
  const [errors, setErrors] = useState<LoginErrors>({ email: "", password: "" })
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState("")
  const expiredNotice =
    (location.state as { expired?: unknown } | null)?.expired === true

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setApiError("")
    const nextErrors: LoginErrors = {
      email: isValidEmail(email) ? "" : "validation.emailInvalid",
      password: password ? "" : "validation.passwordRequired",
    }
    setErrors(nextErrors)
    if (nextErrors.email || nextErrors.password) {
      return
    }

    setSubmitting(true)
    try {
      const data = await loginRequest(email, password)
      applyLoginSuccess(data)
      setLoginSession(data)
      const state = location.state as { from?: unknown } | null
      const afterLogin = isSafeInternalPath(state?.from)
        ? state.from
        : destinationFromLogin(data.redirect_to)
      navigate(afterLogin, { replace: true })
    } catch (error) {
      setApiError(apiErrorText(error, t))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {t("login.title")}
      </h1>
      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
        {expiredNotice ? (
          <p
            role="status"
            className="rounded-lg border border-border bg-secondary px-4 py-3 text-sm"
          >
            {t("login.sessionExpired")}
          </p>
        ) : null}
        {apiError ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {apiError}
          </p>
        ) : null}
        <div className="space-y-2.5">
          <Label htmlFor="login-email">{t("login.email")}</Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="aline@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            disabled={submitting}
            required
          />
          {errors.email ? (
            <p
              id="login-email-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {t(errors.email)}
            </p>
          ) : null}
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="login-password">{t("login.password")}</Label>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder={t("login.passwordPlaceholder")}
              className="pr-14"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "login-password-error" : undefined
              }
              disabled={submitting}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-1.5 right-2"
              aria-label={showPassword ? t("password.hide") : t("password.show")}
              aria-pressed={showPassword}
              disabled={submitting}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <RiEyeOffLine aria-hidden="true" />
              ) : (
                <RiEyeLine aria-hidden="true" />
              )}
            </Button>
          </div>
          {errors.password ? (
            <p
              id="login-password-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {t(errors.password)}
            </p>
          ) : null}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? t("login.submitting") : t("action.signIn")}
          <RiArrowRightLine aria-hidden="true" />
        </Button>
      </form>
      <p className="mt-7 text-center text-sm text-muted-foreground">
        {t("login.noAccount")}{" "}
        <Link
          to="/register"
          className="font-medium text-brand underline-offset-4 hover:underline"
        >
          {t("login.createAccount")}
        </Link>
        {" · "}
        <Link
          to="/join"
          className="font-medium text-brand underline-offset-4 hover:underline"
        >
          {t("login.haveCode")}
        </Link>
      </p>
    </AuthLayout>
  )
}
