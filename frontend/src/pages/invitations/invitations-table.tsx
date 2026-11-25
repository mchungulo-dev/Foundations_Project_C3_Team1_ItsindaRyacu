import type { Invitation } from "@/api/types"
import { Initials } from "@/components/list-row"
import { StatusBadge } from "@/components/status-badge"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useI18n } from "@/i18n/i18n-context"
import { useRoleLabel } from "@/i18n/use-role-label"
import {
  INVITATION_STATUS,
  RevokeInvitation,
  showCode,
  usedOrExpires,
} from "@/pages/invitations/invitation-card"

type InvitationsTableProps = {
  invitations: Invitation[]
  onChanged: () => void
}

export function InvitationsTable({
  invitations,
  onChanged,
}: InvitationsTableProps) {
  const { t, locale } = useI18n()
  const roleLabel = useRoleLabel()

  return (
    <Card className="hidden py-0 xl:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">{t("savings.member")}</TableHead>
            <TableHead scope="col">{t("invitations.colRole")}</TableHead>
            <TableHead scope="col">{t("invitations.colCode")}</TableHead>
            <TableHead scope="col">{t("savings.colStatus")}</TableHead>
            <TableHead scope="col">{t("invitations.colUntil")}</TableHead>
            <TableHead scope="col">
              <span className="sr-only">{t("savings.colActions")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => {
            const { label, tone } = INVITATION_STATUS[invitation.status]
            return (
              <TableRow key={invitation.invitation_id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Initials name={invitation.member_name} />
                    <span className="font-medium">
                      {invitation.member_name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{roleLabel(invitation.role_assigned)}</TableCell>
                <TableCell className="font-mono tracking-widest">
                  {showCode(invitation.invite_token)}
                </TableCell>
                <TableCell>
                  <StatusBadge tone={tone}>{t(label)}</StatusBadge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {usedOrExpires(invitation, t, locale)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <RevokeInvitation
                      invitation={invitation}
                      onChanged={onChanged}
                    />
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
