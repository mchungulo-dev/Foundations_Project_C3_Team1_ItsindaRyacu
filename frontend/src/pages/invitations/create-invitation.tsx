import { useState, type FormEvent } from "react"
import { createInvitation, INVITE_ROLES } from "@/api/invitations"
import type { MemberOption } from "@/api/types"
import { FormDialog } from "@/components/form-dialog"
import { FormError } from "@/components/form-error"
import { SelectField } from "@/components/select-field"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { useSession } from "@/context/session-context"
import { useI18n } from "@/i18n/i18n-context"
import { useRoleLabel } from "@/i18n/use-role-label"
import { can } from "@/lib/permissions"
import { CodeResult, type Created } from "@/pages/invitations/invitation-code"

type CreateInvitationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: MemberOption[]
  onCreated: () => void
}

export function CreateInvitationDialog({
  open,
  onOpenChange,
  members,
  onCreated,
}: CreateInvitationDialogProps) {
  const { t } = useI18n()

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("invitations.create")}
      description={t("invitations.createBody")}
    >
      <CreateInvitationForm
        members={members}
        onClose={() => onOpenChange(false)}
        onCreated={onCreated}
      />
    </FormDialog>
  )
}

function CreateInvitationForm({
  members,
  onClose,
  onCreated,
}: {
  members: MemberOption[]
  onClose: () => void
  onCreated: () => void
}) {
  const { session } = useSession()
  const { t } = useI18n()
  const roleLabel = useRoleLabel()
  const [values, setValues] = useState({ member: "", role: "" })
  const [error, setError] = useState("")
  const [failure, setFailure] = useState<unknown>(null)
  const [sending, setSending] = useState(false)
  const [created, setCreated] = useState<Created | null>(null)
  const canChooseRole = can("manageMembers", session?.user.role)
  const chosen = members.find(
    (item) => String(item.member_id) === values.member
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending) {
      return
    }
    setFailure(null)
    if (!chosen) {
      setError(t("validation.memberChoose"))
      return
    }
    setError("")
    setSending(true)
    try {
      const result = await createInvitation({
        member_id: chosen.member_id,
        role_assigned: values.role || chosen.role,
      })
      setCreated({
        code: result.code,
        expiresAt: result.expiresAt,
        memberId: chosen.member_id,
        name: chosen.member_name,
      })
      onCreated()
    } catch (caught) {
      setFailure(caught)
    }
    setSending(false)
  }

  if (created) {
    return <CodeResult created={created} onClose={onClose} />
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormError error={failure} />
      <SelectField
        id="invite-member"
        label={t("invitations.member")}
        value={values.member}
        onChange={(event) =>
          setValues({ ...values, member: event.target.value, role: "" })
        }
        options={[
          { value: "", label: t("invitations.chooseMember") },
          ...members
            .filter((item) => item.is_active)
            .map((item) => ({
              value: String(item.member_id),
              label: item.member_name,
            })),
        ]}
        error={error}
        disabled={sending}
      />
      {canChooseRole ? (
        <SelectField
          id="invite-role"
          label={t("invitations.role")}
          value={values.role || chosen?.role || "member"}
          onChange={(event) =>
            setValues({ ...values, role: event.target.value })
          }
          options={INVITE_ROLES.map((role) => ({
            value: role,
            label: roleLabel(role),
          }))}
          disabled={sending}
        />
      ) : null}
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
          {t(sending ? "profile.saving" : "invitations.generate")}
        </Button>
      </DialogFooter>
    </form>
  )
}
