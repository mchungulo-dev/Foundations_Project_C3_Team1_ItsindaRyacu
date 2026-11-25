import { useState, type FormEvent } from "react"
import { getContact, updateContact } from "@/api/profile"
import type { Contact } from "@/api/types"
import { LoadingSpinner, RequestError } from "@/components/request-states"
import { SectionCard } from "@/components/section-card"
import { TextField } from "@/components/text-field"
import { Button } from "@/components/ui/button"
import { useSession } from "@/context/session-context"
import { useRequest } from "@/hooks/use-request"
import { apiErrorText } from "@/i18n/api-messages"
import { useI18n } from "@/i18n/i18n-context"
import { isValidEmail, isValidRwandaPhone, phoneForApi } from "@/lib/validation"

export function ContactCard() {
  const { session } = useSession()
  const { t } = useI18n()
  const { data, error, reload } = useRequest(getContact)

  return (
    <SectionCard title={t("profile.contactTitle")}>
      {error ? (
        <RequestError error={error} onRetry={reload} />
      ) : !data ? (
        <LoadingSpinner />
      ) : (
        <ContactForm
          contact={data}
          sessionEmail={session?.user.email ?? ""}
          onSaved={reload}
        />
      )}
    </SectionCard>
  )
}

type ContactFormProps = {
  contact: Contact
  sessionEmail: string
  onSaved: () => void
}

function ContactForm({ contact, sessionEmail, onSaved }: ContactFormProps) {
  const { t } = useI18n()
  const [phone, setPhone] = useState(contact.phone)
  const [email, setEmail] = useState(contact.email || sessionEmail)
  const [phoneError, setPhoneError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [serverError, setServerError] = useState("")
  const [saved, setSaved] = useState(false)
  const [sending, setSending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextPhoneError = isValidRwandaPhone(phone)
      ? ""
      : t("validation.phoneInvalid")
    const nextEmailError = isValidEmail(email)
      ? ""
      : t("validation.emailInvalid")
    setPhoneError(nextPhoneError)
    setEmailError(nextEmailError)
    setSaved(false)
    setServerError("")
    if (nextPhoneError || nextEmailError) {
      return
    }
    setSending(true)
    try {
      await updateContact({
        phone: phoneForApi(phone),
        email: email.trim().toLowerCase(),
      })
      setSaved(true)
      onSaved()
    } catch (failure) {
      setServerError(apiErrorText(failure, t))
    }
    setSending(false)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <TextField
        id="profile-phone"
        label={t("profile.phone")}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="0788 123 456"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        error={phoneError}
      />
      <TextField
        id="profile-email"
        label={t("profile.email")}
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={emailError}
      />
      {serverError ? (
        <p role="alert" className="text-sm text-destructive">
          {serverError}
        </p>
      ) : null}
      {saved ? (
        <p role="status" className="rounded-lg bg-secondary p-4 text-sm">
          {t("profile.saved")}
        </p>
      ) : null}
      <Button type="submit" disabled={sending} className="w-full sm:w-auto">
        {t(sending ? "profile.saving" : "profile.save")}
      </Button>
    </form>
  )
}
