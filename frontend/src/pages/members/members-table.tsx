import { Link } from "react-router-dom"
import { RiPhoneLine } from "@remixicon/react"
import { joinedDate, memberStatus } from "@/api/members"
import type { Member } from "@/api/types"
import { Initials, ListRow, RowList } from "@/components/list-row"
import { RowMenu } from "@/components/row-menu"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
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
import { formatDate } from "@/lib/format"
import {
  MEMBER_STATUS_KEYS,
  MEMBER_STATUS_TONE,
} from "@/pages/members/member-status"

type MembersTableProps = {
  members: Member[]
  canEdit: boolean
  onEdit: (member: Member) => void
}

export function RoleBadge({ role }: { role: string }) {
  const roleLabel = useRoleLabel()

  return role === "member" ? (
    <span className="text-muted-foreground">{roleLabel(role)}</span>
  ) : (
    <StatusBadge tone="good">{roleLabel(role)}</StatusBadge>
  )
}

export function MembersTable({ members, canEdit, onEdit }: MembersTableProps) {
  const { t, locale } = useI18n()

  return (
    <>
      <div className="md:hidden">
        <RowList className="rounded-xl border border-border bg-card p-4">
          {members.map((member) => (
            <ListRow
              key={member.member_id}
              leading={<Initials name={member.member_name} />}
              title={member.member_name}
              to={`/members/${member.member_id}`}
              subtitle={
                <>
                  <RoleBadge role={member.role} />
                  {" · "}
                  {t(MEMBER_STATUS_KEYS[memberStatus(member)])}
                </>
              }
              note={
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label={`${t("members.call")} ${member.member_name}`}
                  render={<a href={`tel:${member.phone}`} />}
                  nativeButton={false}
                >
                  <RiPhoneLine aria-hidden="true" />
                </Button>
              }
            />
          ))}
        </RowList>
      </div>
      <Card className="hidden py-0 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">{t("members.colMember")}</TableHead>
              <TableHead scope="col">{t("members.colRole")}</TableHead>
              <TableHead scope="col">{t("members.colStatus")}</TableHead>
              <TableHead scope="col">{t("members.joined")}</TableHead>
              <TableHead scope="col">
                <span className="sr-only">{t("savings.colActions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.member_id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Initials name={member.member_name} />
                    <div>
                      <Link
                        to={`/members/${member.member_id}`}
                        className="font-medium hover:underline hover:underline-offset-4"
                      >
                        {member.member_name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {member.phone}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <RoleBadge role={member.role} />
                </TableCell>
                <TableCell>
                  <StatusBadge tone={MEMBER_STATUS_TONE[memberStatus(member)]}>
                    {t(MEMBER_STATUS_KEYS[memberStatus(member)])}
                  </StatusBadge>
                </TableCell>
                <TableCell>{formatDate(joinedDate(member), locale)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`${t("members.call")} ${member.member_name}`}
                      className="text-muted-foreground"
                      render={<a href={`tel:${member.phone}`} />}
                      nativeButton={false}
                    >
                      <RiPhoneLine aria-hidden="true" />
                    </Button>
                    <RowMenu
                      label={t("savings.menu")}
                      items={[
                        {
                          label: t("members.viewProfile"),
                          to: `/members/${member.member_id}`,
                        },
                        {
                          label: t("statements.view"),
                          to: `/statements?member=${member.member_id}`,
                        },
                        ...(canEdit
                          ? [
                              {
                                label: t("members.edit"),
                                onSelect: () => onEdit(member),
                              },
                            ]
                          : []),
                      ]}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  )
}
