import { useState, type FormEvent } from "react"
import { updateMember, type MemberFields } from "@/api/members"
import type { Member } from "@/api/types"
import { FormDialog } from "@/components/form-dialog"
import { FormError } from "@/components/form-error"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { useI18n } from "@/i18n/i18n-context"
import { hasErrors } from "@/lib/validation"
import {
  MemberFieldsInputs,
  NO_MEMBER_ERRORS,
  useMemberValidation,
} from "@/pages/members/member-fields"

type EditMemberDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: Member
  onSaved: () => void
}

export function EditMemberDialog({
  open,
  onOpenChange,
  member,
  onSaved,
}: EditMemberDialogProps) {
  const { t } = useI18n()

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("members.editTitle")}
    >
      <EditMemberForm
        member={member}
        onCancel={() => onOpenChange(false)}
        onSaved={() => {
          onOpenChange(false)
          onSaved()
        }}
      />
    </FormDialog>
  )
}

type EditMemberFormProps = {
  member: Member
  onCancel: () => void
  onSaved: () => void
}

function EditMemberForm({ member, onCancel, onSaved }: EditMemberFormProps) {
  const { t } = useI18n()
  const validate = useMemberValidation()
  const [values, setValues] = useState<MemberFields>({
    name: member.member_name,
    email: member.email ?? "",
    phone: member.phone,
    nationalId: String(member.national_id_number),
  })
  const [errors, setErrors] = useState(NO_MEMBER_ERRORS)
  const [failure, setFailure] = useState<unknown>(null)
  const [sending, setSending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    setFailure(null)
    if (hasErrors(nextErrors)) {
      return
    }
    setSending(true)
    try {
      await updateMember(member.member_id, values)
      onSaved()
    } catch (caught) {
      setFailure(caught)
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormError error={failure} />
      <MemberFieldsInputs
        values={values}
        errors={errors}
        disabled={sending}
        onChange={setValues}
      />
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={sending}
          onClick={onCancel}
        >
          {t("action.cancel")}
        </Button>
        <Button type="submit" disabled={sending}>
          {t(sending ? "profile.saving" : "profile.save")}
        </Button>
      </DialogFooter>
    </form>
  )
}
