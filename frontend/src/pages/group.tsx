import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { useSession } from "@/context/session-context"
import {
  demoGroup,
  totalOf,
  type Contribution,
  type Member,
} from "@/data/demo-data"
import { useI18n } from "@/i18n/i18n-context"
import type { MessageKey } from "@/i18n/locales/en"
import { useRoleLabel } from "@/i18n/use-role-label"
import { formatMoney } from "@/lib/format"

type GroupPageProps = {
  members: Member[]
  contributions: Contribution[]
}

export function GroupPage({ members, contributions }: GroupPageProps) {
  const { session } = useSession()
  const { t, locale } = useI18n()
  const roleLabel = useRoleLabel()
  const leaders = members.filter(
    (member) => member.role === "chairperson" || member.role === "treasurer"
  )
  const meetingDay = t(
    `day.${demoGroup.meetingDay.toLowerCase()}` as MessageKey
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {session?.user.group_name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {demoGroup.location}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("group.members")}
            </p>
            <p className="mt-3 text-3xl font-semibold">{members.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("savings.total")}
            </p>
            <p className="mt-3 text-2xl font-semibold">
              {formatMoney(totalOf(contributions), locale)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("group.monthlySaving")}
            </p>
            <p className="mt-3 text-2xl font-semibold">
              {formatMoney(demoGroup.monthlyTarget, locale)}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardContent>
            <h2 className="mb-5 font-medium">{t("group.details")}</h2>
            <dl className="grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">
                  {t("group.location")}
                </dt>
                <dd className="mt-2 font-medium">{demoGroup.location}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">
                  {t("group.meetings")}
                </dt>
                <dd className="mt-2 font-medium">
                  {meetingDay} · {demoGroup.meetingTime}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h2 className="mb-5 font-medium">{t("group.leaders")}</h2>
            {leaders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("group.noLeaders")}
              </p>
            ) : (
              <ul className="space-y-3">
                {leaders.map((member) => (
                  <li
                    key={member.id}
                    className="flex flex-wrap items-center justify-between gap-2"
                  >
                    <span className="font-medium">{member.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {roleLabel(member.role)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent>
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-medium">{t("group.membersTitle")}</h2>
            <Link to="/members" className="text-sm font-medium text-brand">
              {t("group.manage")}
            </Link>
          </div>
          {members.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t("group.noMembers")}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {members.map((member) => (
                <li key={member.id}>
                  <Link
                    to={`/members/${member.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded px-2 py-4 hover:bg-muted"
                  >
                    <span className="font-medium">{member.name}</span>
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
    </div>
  )
}
