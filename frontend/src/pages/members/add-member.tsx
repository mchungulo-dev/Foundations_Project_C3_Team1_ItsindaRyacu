import { useState, type FormEvent } from "react"
import {
  addMember,
  type MemberFields,
} from "@/api/members"
import { FormDialog } from "@/components/form-dialog"
import { FormError } from "@/components/form-error"
import { SelectField } from "@/components/select-field"
import { TextField } from "@/components/text-field"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { useSession } from "@/context/session-context"
import { useI18n } from "@/i18n/i18n-context"
import { useRoleLabel } from "@/i18n/use-role-label"
import { can } from "@/lib/permissions"
import { hasErrors, isValidPassword } from "@/lib/validation"
import {
  MemberFieldsInputs,
  NO_MEMBER_ERRORS,
  useMemberValidation,
} from "@/pages/members/member-fields"

const ROLES = ["member", "chairperson", "treasurer", "secretary"]
const EMPTY: MemberFields = { name: "", email: "", phone: "", nationalId: "" }

type AddMemberDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdded: (name: string) => void
}

export function AddMemberDialog({
  open,
  onOpenChange,
  onAdded,
}: AddMemberDialogProps) {
  const { t } = useI18n()

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("members.new")}
      description={t("members.passwordHint")}
    >
      <AddMemberForm
        onCancel={() => onOpenChange(false)}
        onAdded={(name) => {
          onOpenChange(false)
          onAdded(name)
        }}
      />
    </FormDialog>
  )
}

function AddMemberForm({
  onCancel,
  onAdded,
}: {
  onCancel: () => void
  onAdded: (name: string) => void
}) {
  const { t } = useI18n()
  const { session } = useSession()
  const roleLabel = useRoleLabel()
  const validate = useMemberValidation()
  const [values, setValues] = useState(EMPTY)
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("member")
  const [errors, setErrors] = useState(NO_MEMBER_ERRORS)
  const [passwordError, setPasswordError] = useState("")
  const [failure, setFailure] = useState<unknown>(null)
  const [sending, setSending] = useState(false)
  const chooseRole = can("manageMembers", session?.user.role)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate(values)
    const nextPasswordError = isValidPassword(password)
      ? ""
      : t("validation.passwordShort")
    setErrors(nextErrors)
    setPasswordError(nextPasswordError)
    setFailure(null)
    if (hasErrors(nextErrors) || nextPasswordError) {
      return
    }
    setSending(true)
    try {
      await addMember({ ...values, password, role })
      onAdded(values.name.trim())
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
      <TextField
        id="member-password"
        label={t("members.password")}
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={passwordError}
        disabled={sending}
      />
      {chooseRole ? (
        <SelectField
          id="member-role"
          label={t("members.colRole")}
          value={role}
          onChange={(event) => setRole(event.target.value)}
          options={ROLES.map((item) => ({
            value: item,
            label: roleLabel(item),
          }))}
          disabled={sending}
        />
      ) : null}
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
          {t(sending ? "members.adding" : "members.add")}
        </Button>
      </DialogFooter>
    </form>
  )
}
