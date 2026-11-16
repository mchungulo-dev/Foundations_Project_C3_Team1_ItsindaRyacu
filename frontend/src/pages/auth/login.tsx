import { useState, type FormEvent } from "react"
import { RiArrowRightLine, RiEyeLine, RiEyeOffLine } from "@remixicon/react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/layouts/auth-layout"
import { useSession } from "@/context/session-context"
import { applyLoginSuccess, ApiError, loginRequest } from "@/lib/api"
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

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setLoginSession } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({ email: "", password: "" })
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setApiError("")
    const nextErrors = {
      email: isValidEmail(email) ? "" : "Enter a valid email address.",
      password: password ? "" : "Enter your password.",
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
      if (error instanceof ApiError) {
        setApiError(error.message)
        return
      }
      setApiError("Could not reach the server. Is it running?")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Sign in
      </h1>
      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
        {apiError ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {apiError}
          </p>
        ) : null}
        <div className="space-y-2.5">
          <Label htmlFor="login-email">Email</Label>
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
              {errors.email}
            </p>
          ) : null}
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="login-password">Password</Label>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
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
              aria-label={showPassword ? "Hide password" : "Show password"}
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
              {errors.password}
            </p>
          ) : null}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
          <RiArrowRightLine aria-hidden="true" />
        </Button>
      </form>
      <p className="mt-7 text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link
          to="/register"
          className="font-medium text-brand underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
