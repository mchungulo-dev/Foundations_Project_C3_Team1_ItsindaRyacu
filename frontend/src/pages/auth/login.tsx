import { useState, type FormEvent } from "react"
import { RiArrowRightLine, RiEyeLine, RiEyeOffLine } from "@remixicon/react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/layouts/auth-layout"
import { isValidRwandaPhone } from "@/lib/validation"

export function LoginPage() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState("")
  const [pin, setPin] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [errors, setErrors] = useState({ phone: "", pin: "" })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = {
      phone: isValidRwandaPhone(phone)
        ? ""
        : "Enter a valid number, e.g. 0788 123 456.",
      pin: /^\d{4}$/.test(pin) ? "" : "Enter a 4-digit PIN.",
    }
    setErrors(nextErrors)
    if (!nextErrors.phone && !nextErrors.pin) {
      navigate("/dashboard")
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Sign in
      </h1>
      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
        <div className="space-y-2.5">
          <Label htmlFor="login-phone">Phone number</Label>
          <Input
            id="login-phone"
            type="tel"
            autoComplete="tel"
            placeholder="0788 123 456"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "login-phone-error" : undefined}
            required
          />
          {errors.phone ? (
            <p
              id="login-phone-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {errors.phone}
            </p>
          ) : null}
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="login-pin">4-digit PIN</Label>
          <div className="relative">
            <Input
              id="login-pin"
              type={showPin ? "text" : "password"}
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              placeholder="Enter your PIN"
              className="pr-14"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              aria-invalid={Boolean(errors.pin)}
              aria-describedby={errors.pin ? "login-pin-error" : undefined}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-1.5 right-2"
              aria-label={showPin ? "Hide PIN" : "Show PIN"}
              aria-pressed={showPin}
              onClick={() => setShowPin(!showPin)}
            >
              {showPin ? (
                <RiEyeOffLine aria-hidden="true" />
              ) : (
                <RiEyeLine aria-hidden="true" />
              )}
            </Button>
          </div>
          {errors.pin ? (
            <p
              id="login-pin-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {errors.pin}
            </p>
          ) : null}
        </div>
        <Button type="submit" size="lg" className="w-full">
          Sign in
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
