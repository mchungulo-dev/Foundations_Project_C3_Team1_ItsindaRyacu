import { useState } from "react"
import {
  deactivateMember,
  reactivateMember,
} from "@/api/members"
import type { Member } from "@/api/types"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { RowMenu } from "@/components/row-menu"
import { Button } from "@/components/ui/button"
import { useSession } from "@/context/session-context"
import { useI18n } from "@/i18n/i18n-context"
import { can } from "@/lib/permissions"
import { EditMemberDialog } from "@/pages/members/edit-member"
import { PasswordDialog } from "@/pages/members/password-dialog"
import { RoleDialog } from "@/pages/members/role-dialog"

type Dialogs = "edit" | "role" | "password" | "deactivate" | "reactivate" | null

export function MemberActions({
  member,
  onChanged,
}: {
  member: Member
  onChanged: () => void
}) {
  const { session } = useSession()
  const { t } = useI18n()
  const [open, setOpen] = useState<Dialogs>(null)
  const role = session?.user.role
  const isSelf = member.member_id === session?.user.member_id
  const admin = can("manageMembers", role)
  const extras = admin
  const show = {
    edit: can("editMember", role),
    role: extras && member.role !== "admin",
    password: extras,
    deactivate:
      admin && Boolean(member.is_active) && !isSelf && member.role === "member",
    reactivate: extras && !member.is_active,
  }

  if (!Object.values(show).some(Boolean)) {
    return null
  }

  const close = (next: boolean) => {
    if (!next) {
      setOpen(null)
    }
  }

  return (
    <>
      {show.edit ? (
        <Button variant="outline" onClick={() => setOpen("edit")}>
          {t("members.edit")}
        </Button>
      ) : null}
      <RowMenu
        label={t("savings.menu")}
        items={[
          ...(show.role
            ? [
                {
                  label: t("members.roleChange"),
                  onSelect: () => setOpen("role"),
                },
              ]
            : []),
          ...(show.password
            ? [
                {
                  label: t("members.passwordReset"),
                  onSelect: () => setOpen("password"),
                },
              ]
            : []),
          ...(show.reactivate
            ? [
                {
                  label: t("members.reactivate"),
                  onSelect: () => setOpen("reactivate"),
                },
              ]
            : []),
          ...(show.deactivate
            ? [
                {
                  label: t("members.deactivate"),
                  onSelect: () => setOpen("deactivate"),
                  destructive: true,
                },
              ]
            : []),
        ]}
      />
      <EditMemberDialog
        open={open === "edit"}
        onOpenChange={close}
        member={member}
        onSaved={onChanged}
      />
      <RoleDialog
        open={open === "role"}
        onOpenChange={close}
        member={member}
        onSaved={onChanged}
      />
      <PasswordDialog
        open={open === "password"}
        onOpenChange={close}
        member={member}
      />
      <ConfirmDialog
        open={open === "deactivate"}
        onOpenChange={close}
        title={t("members.deactivateTitle")}
        body={t("members.deactivateBody")}
        confirmLabel={t("members.deactivateConfirm")}
        destructive
        onConfirm={async () => {
          await deactivateMember(member.member_id)
          onChanged()
        }}
      />
      <ConfirmDialog
        open={open === "reactivate"}
        onOpenChange={close}
        title={t("members.reactivateTitle")}
        body={t("members.reactivateBody")}
        confirmLabel={t("members.reactivate")}
        onConfirm={async () => {
          await reactivateMember(member.member_id)
          onChanged()
        }}
      />
    </>
  )
}
