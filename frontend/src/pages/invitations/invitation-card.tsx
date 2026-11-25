import { useState } from "react"
import { revokeInvitation } from "@/api/invitations"
import type { Invitation, InvitationStatus } from "@/api/types"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/i18n/i18n-context"
import { useRoleLabel } from "@/i18n/use-role-label"
import type { MessageKey } from "@/i18n/locales/en"
import { formatDate } from "@/lib/format"

export const INVITATION_STATUS: Record<
  InvitationStatus,
  { label: MessageKey; tone: "good" | "warn" | "bad" }
> = {
  pending: { label: "invitations.statusPending", tone: "warn" },
  accepted: { label: "invitations.statusAccepted", tone: "good" },
  expired: { label: "invitations.statusExpired", tone: "bad" },
  revoked: { label: "invitations.statusRevoked", tone: "bad" },
}

export function showCode(code: string) {
  return `${code.slice(0, 4)}-${code.slice(4)}`
}

export function usedOrExpires(
  invitation: Invitation,
  t: ReturnType<typeof useI18n>["t"],
  locale: ReturnType<typeof useI18n>["locale"]
) {
  return invitation.accepted_at
    ? t("invitations.usedOn", {
        date: formatDate(invitation.accepted_at.slice(0, 10), locale),
      })
    : t("invitations.expires", {
        date: formatDate(invitation.expires_at.slice(0, 10), locale),
      })
}

export function RevokeInvitation({
  invitation,
  onChanged,
}: {
  invitation: Invitation
  onChanged: () => void
}) {
  const { t } = useI18n()
  const [revoking, setRevoking] = useState(false)

  if (invitation.status !== "pending") {
    return null
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setRevoking(true)}>
        {t("invitations.revoke")}
      </Button>
      <ConfirmDialog
        open={revoking}
        onOpenChange={setRevoking}
        title={t("invitations.revokeTitle")}
        body={t("invitations.revokeBody", {
          code: showCode(invitation.invite_token),
          name: invitation.member_name,
        })}
        confirmLabel={t("invitations.revoke")}
        destructive
        onConfirm={async () => {
          await revokeInvitation(invitation.invitation_id)
          onChanged()
        }}
      />
    </>
  )
}

type InvitationCardProps = {
  invitation: Invitation
  onChanged: () => void
}

export function InvitationCard({ invitation, onChanged }: InvitationCardProps) {
  const { t, locale } = useI18n()
  const roleLabel = useRoleLabel()
  const { label, tone } = INVITATION_STATUS[invitation.status]

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold">{invitation.member_name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {roleLabel(invitation.role_assigned)}
            </p>
          </div>
          <StatusBadge tone={tone}>{t(label)}</StatusBadge>
        </div>
        <p className="font-mono text-lg tracking-widest">
          {showCode(invitation.invite_token)}
        </p>
        <p className="text-sm text-muted-foreground">
          {usedOrExpires(invitation, t, locale)}
        </p>
        <RevokeInvitation invitation={invitation} onChanged={onChanged} />
      </CardContent>
    </Card>
  )
}
