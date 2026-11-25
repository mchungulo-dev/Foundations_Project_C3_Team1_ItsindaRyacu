import { useState, type FormEvent } from "react"
import { resetPassword } from "@/api/members"
import type { Member } from "@/api/types"
import { FormDialog } from "@/components/form-dialog"
import { FormError } from "@/components/form-error"
import { TextField } from "@/components/text-field"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { useI18n } from "@/i18n/i18n-context"
import { isValidPassword } from "@/lib/validation"

type PasswordDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: Member
}

export function PasswordDialog({
  open,
  onOpenChange,
  member,
}: PasswordDialogProps) {
  const { t } = useI18n()

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("members.passwordTitle")}
      description={t("members.passwordBody")}
    >
      <PasswordForm member={member} onClose={() => onOpenChange(false)} />
    </FormDialog>
  )
}

function PasswordForm({
  member,
  onClose,
}: {
  member: Member
  onClose: () => void
}) {
  const { t } = useI18n()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [failure, setFailure] = useState<unknown>(null)
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextError = isValidPassword(password)
      ? ""
      : t("validation.passwordShort")
    setError(nextError)
    setFailure(null)
    if (nextError) {
      return
    }
    setSending(true)
    try {
      await resetPassword(member.member_id, password)
      setDone(true)
    } catch (caught) {
      setFailure(caught)
    }
    setSending(false)
  }

  if (done) {
    return (
      <>
        <p role="status" className="rounded-lg bg-secondary p-4 text-sm">
          {t("members.passwordDone", { name: member.member_name })}
        </p>
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            {t("action.close")}
          </Button>
        </DialogFooter>
      </>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormError error={failure} />
      <TextField
        id="reset-password"
        label={t("members.passwordNew")}
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={error}
        disabled={sending}
      />
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={sending}
          onClick={onClose}
        >
          {t("action.cancel")}
        </Button>
        <Button type="submit" disabled={sending}>
          {t("members.passwordReset")}
        </Button>
      </DialogFooter>
    </form>
  )
}
