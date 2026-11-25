import { useState, type FormEvent } from "react"
import { changeRole, getMembers } from "@/api/members"
import type { Member } from "@/api/types"
import { FormDialog } from "@/components/form-dialog"
import { FormError } from "@/components/form-error"
import { SelectField } from "@/components/select-field"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { useRequest } from "@/hooks/use-request"
import { useI18n } from "@/i18n/i18n-context"
import { useRoleLabel } from "@/i18n/use-role-label"

const ROLES = ["member", "chairperson", "treasurer", "secretary"]

type RoleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: Member
  onSaved: () => void
}

export function RoleDialog({
  open,
  onOpenChange,
  member,
  onSaved,
}: RoleDialogProps) {
  const { t } = useI18n()

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("members.roleTitle")}
      description={t("members.roleBody")}
    >
      <RoleForm
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

type RoleFormProps = {
  member: Member
  onCancel: () => void
  onSaved: () => void
}

function RoleForm({ member, onCancel, onSaved }: RoleFormProps) {
  const { t } = useI18n()
  const roleLabel = useRoleLabel()
  const { data: members } = useRequest(getMembers)
  const [role, setRole] = useState(
    ROLES.includes(member.role) ? member.role : "member"
  )
  const [failure, setFailure] = useState<unknown>(null)
  const [sending, setSending] = useState(false)
  const holder =
    role === "member"
      ? undefined
      : members?.find(
          (item) =>
            item.member_id !== member.member_id &&
            item.is_active &&
            item.role === role
        )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFailure(null)
    setSending(true)
    try {
      await changeRole(member.member_id, role)
      onSaved()
    } catch (caught) {
      setFailure(caught)
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormError error={failure} />
      <SelectField
        id="role-select"
        label={t("members.colRole")}
        value={role}
        onChange={(event) => setRole(event.target.value)}
        options={ROLES.map((item) => ({ value: item, label: roleLabel(item) }))}
        disabled={sending}
      />
      {holder ? (
        <p role="note" className="rounded-lg bg-secondary p-4 text-sm">
          {t("members.roleHeld", {
            name: holder.member_name,
            role: roleLabel(role),
          })}
        </p>
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
        <Button type="submit" disabled={sending || role === member.role}>
          {t("members.roleChange")}
        </Button>
      </DialogFooter>
    </form>
  )
}
