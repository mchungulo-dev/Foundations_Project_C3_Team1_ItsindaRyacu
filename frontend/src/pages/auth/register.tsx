import { useState, type FormEvent } from "react"
import {
  RiArrowRightLine,
  RiCheckLine,
  RiEyeLine,
  RiEyeOffLine,
  RiTeamLine,
} from "@remixicon/react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/layouts/auth-layout"
import type { RegisteredAccount } from "@/lib/register-account"
import {
  digitsOnly,
  isValidEmail,
  isValidNationalId,
  isValidPassword,
  isValidRwandaPhone,
} from "@/lib/validation"

export function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [nationalId, setNationalId] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    nationalId: "",
    password: "",
    confirmPassword: "",
  })
  const [account, setAccount] = useState<RegisteredAccount | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = {
      name: name.trim() ? "" : "Enter your full name.",
      email: isValidEmail(email) ? "" : "Enter a valid email address.",
      phone: isValidRwandaPhone(phone)
        ? ""
        : "Enter a valid number, e.g. 0788 123 456.",
      nationalId: isValidNationalId(nationalId)
        ? ""
        : "Enter your 16-digit national ID number.",
      password: isValidPassword(password)
        ? ""
        : "Use at least 8 characters.",
      confirmPassword: !confirmPassword
        ? "Confirm your password."
        : confirmPassword !== password
          ? "Passwords do not match."
          : "",
    }
    setErrors(nextErrors)

    const valid = Object.values(nextErrors).every((message) => !message)
    if (!valid) {
      return
    }

    setAccount({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      nationalId,
    })
  }

  if (account) {
    return (
      <AuthLayout>
        <div
          role="status"
          className="flex gap-3 rounded-xl border border-border bg-secondary p-4 text-sm leading-relaxed text-secondary-foreground"
        >
          <RiCheckLine className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-medium text-foreground">Account created.</p>
            <p>
              Next, set up your savings group. You will be the group admin.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <Button
            size="lg"
            className="w-full"
            onClick={() =>
              navigate("/register/create-group", { state: { account } })
            }
          >
            <RiTeamLine aria-hidden="true" />
            Create a savings group
            <RiArrowRightLine aria-hidden="true" />
          </Button>
          <Button
            render={<Link to="/login" />}
            nativeButton={false}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Skip for now · Sign in
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Create an account
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Register to start a savings group.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
        <div className="space-y-2.5">
          <Label htmlFor="register-name">Full name</Label>
          <Input
            id="register-name"
            autoComplete="name"
            placeholder="Aline Nyiraneza"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "register-name-error" : undefined}
            required
          />
          {errors.name ? (
            <p
              id="register-name-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {errors.name}
            </p>
          ) : null}
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="register-email">Email</Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="aline@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "register-email-error" : undefined}
            required
          />
          {errors.email ? (
            <p
              id="register-email-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {errors.email}
            </p>
          ) : null}
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="register-phone">Phone number</Label>
          <Input
            id="register-phone"
            type="tel"
            autoComplete="tel"
            placeholder="0788 123 456"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "register-phone-error" : undefined}
            required
          />
          {errors.phone ? (
            <p
              id="register-phone-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {errors.phone}
            </p>
          ) : null}
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="register-national-id">National ID number</Label>
          <Input
            id="register-national-id"
            inputMode="numeric"
            autoComplete="off"
            placeholder="1199770023456789"
            maxLength={16}
            value={nationalId}
            onChange={(event) =>
              setNationalId(digitsOnly(event.target.value, 16))
            }
            aria-invalid={Boolean(errors.nationalId)}
            aria-describedby={
              errors.nationalId ? "register-national-id-error" : undefined
            }
            required
          />
          {errors.nationalId ? (
            <p
              id="register-national-id-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {errors.nationalId}
            </p>
          ) : null}
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="register-password">Password</Label>
          <div className="relative">
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="pr-14"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "register-password-error" : undefined
              }
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-1.5 right-2"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
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
              id="register-password-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {errors.password}
            </p>
          ) : null}
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="register-confirm-password">Confirm password</Label>
          <div className="relative">
            <Input
              id="register-confirm-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              className="pr-14"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={
                errors.confirmPassword
                  ? "register-confirm-password-error"
                  : undefined
              }
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-1.5 right-2"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <RiEyeOffLine aria-hidden="true" />
              ) : (
                <RiEyeLine aria-hidden="true" />
              )}
            </Button>
          </div>
          {errors.confirmPassword ? (
            <p
              id="register-confirm-password-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {errors.confirmPassword}
            </p>
          ) : null}
        </div>
        <Button type="submit" size="lg" className="w-full">
          Create account
          <RiArrowRightLine aria-hidden="true" />
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-brand underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
