import { Link, useParams } from "react-router-dom"
import { RiArrowLeftLine } from "@remixicon/react"
import { Card, CardContent } from "@/components/ui/card"
import { useSession } from "@/context/session-context"
import { demoGroup, type Member } from "@/data/demo-data"
import { useI18n } from "@/i18n/i18n-context"
import { useRoleLabel } from "@/i18n/use-role-label"
import { formatDate, formatMoney } from "@/lib/format"
import { MEMBER_STATUS_KEYS } from "@/pages/members/member-status"

export function MemberDetailsPage({ members }: { members: Member[] }) {
  const { memberId } = useParams()
  const { session } = useSession()
  const { t, locale } = useI18n()
  const roleLabel = useRoleLabel()
  const member = members.find((item) => item.id === memberId)

  if (!member) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">{t("members.notFound")}</h1>
        <Link to="/members" className="text-brand underline underline-offset-4">
          {t("members.backToList")}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        to="/members"
        className="inline-flex items-center gap-2 text-sm text-brand"
      >
        <RiArrowLeftLine className="size-4" aria-hidden="true" />
        {t("members.title")}
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {member.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {roleLabel(member.role)}
          </p>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-sm">
          {t(MEMBER_STATUS_KEYS[member.status])}
        </span>
      </div>
      <div className="grid gap-5 md:grid-cols-[2fr_1fr]">
        <Card>
          <CardContent>
            <h2 className="mb-6 font-medium">{t("members.details")}</h2>
            <dl className="grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">
                  {t("members.phone")}
                </dt>
                <dd className="mt-2 font-medium">{member.phone}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">
                  {t("members.group")}
                </dt>
                <dd className="mt-2">
                  <Link
                    to="/group"
                    className="font-medium text-brand hover:underline"
                  >
                    {session?.user.group_name ?? demoGroup.name}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">
                  {t("members.joined")}
                </dt>
                <dd className="mt-2 font-medium">
                  {formatDate(member.joinedAt, locale)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">
                  {t("members.colRole")}
                </dt>
                <dd className="mt-2 font-medium">{roleLabel(member.role)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card className="border-0 bg-[#006b4f] text-white">
          <CardContent>
            <p className="text-sm text-white/75">{t("savings.total")}</p>
            <p className="mt-5 text-3xl font-semibold">
              {formatMoney(member.totalSavings, locale)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
