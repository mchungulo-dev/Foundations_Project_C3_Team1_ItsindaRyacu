import { Link } from "react-router-dom"
import { LoadingRows, RequestError } from "@/components/request-states"
import { Card, CardContent } from "@/components/ui/card"
import { useSession } from "@/context/session-context"
import { useRequest } from "@/hooks/use-request"
import { useI18n } from "@/i18n/i18n-context"
import { useRoleLabel } from "@/i18n/use-role-label"
import { getMembers, memberStatus } from "@/lib/members-api"
import { canManageMembers } from "@/lib/permissions"

export function GroupPage() {
  const { session } = useSession()
  const { t } = useI18n()
  const roleLabel = useRoleLabel()
  const canSeeMembers = canManageMembers(session?.user.role)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {session?.user.group_name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {session ? roleLabel(session.user.role) : ""}
        </p>
      </div>
      <p className="rounded-lg border border-border bg-secondary px-4 py-3 text-sm">
        {t("group.detailsPending")}
      </p>
      {canSeeMembers ? <GroupMembers /> : null}
    </div>
  )
}

function GroupMembers() {
  const { t } = useI18n()
  const roleLabel = useRoleLabel()
  const { data, error, loading, reload } = useRequest(getMembers)
  const members = (data ?? []).filter(
    (member) => memberStatus(member) === "Active"
  )

  return (
    <Card>
      <CardContent>
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="font-medium">
            {t("group.membersTitle")}
            {data ? ` (${members.length})` : ""}
          </h2>
          <Link to="/members" className="text-sm font-medium text-brand">
            {t("group.manage")}
          </Link>
        </div>
        {error ? (
          <RequestError error={error} onRetry={reload} />
        ) : !data && loading ? (
          <LoadingRows />
        ) : members.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t("group.noMembers")}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {members.map((member) => (
              <li key={member.member_id}>
                <Link
                  to={`/members/${member.member_id}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded px-2 py-4 hover:bg-muted"
                >
                  <span className="font-medium">{member.member_name}</span>
                  <span className="text-sm text-muted-foreground">
                    {roleLabel(member.role)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
