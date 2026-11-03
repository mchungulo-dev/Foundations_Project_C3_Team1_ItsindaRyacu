import { useState, type FormEvent } from "react"
import { RiArrowRightLine, RiCheckLine } from "@remixicon/react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/layouts/auth-layout"
import { isValidRwandaPhone } from "@/lib/validation"

export function RegisterPage() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [invitationCode, setInvitationCode] = useState("")
  const [errors, setErrors] = useState({ name: "", phone: "" })
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = {
      name: name.trim() ? "" : "Enter your full name.",
      phone: isValidRwandaPhone(phone)
        ? ""
        : "Enter a valid number, e.g. 0788 123 456.",
    }
    setErrors(nextErrors)
    setSubmitted(!nextErrors.name && !nextErrors.phone)
  }

  return (
    <AuthLayout>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Create an account
      </h1>
      <form
        onSubmit={handleSubmit}
        onChange={() => setSubmitted(false)}
        noValidate
        className="mt-8 space-y-6"
      >
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
          <Label htmlFor="register-invitation">
            Invitation code (optional)
          </Label>
          <Input
            id="register-invitation"
            autoComplete="off"
            placeholder="TWZ-2026"
            value={invitationCode}
            onChange={(event) => setInvitationCode(event.target.value)}
            aria-describedby="invitation-help"
          />
          <p
            id="invitation-help"
            className="text-xs leading-relaxed text-muted-foreground"
          >
            Leave blank to start your own group.
          </p>
        </div>
        <Button type="submit" size="lg" className="w-full">
          Continue
          <RiArrowRightLine aria-hidden="true" />
        </Button>
      </form>
      {submitted ? (
        <div
          role="status"
          className="mt-5 flex gap-3 rounded-xl border border-border bg-secondary p-4 text-sm leading-relaxed text-secondary-foreground"
        >
          <RiCheckLine className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p>Details confirmed.</p>
        </div>
      ) : null}
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
