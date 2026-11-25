import { Initials } from "@/components/list-row"
import { SectionCard } from "@/components/section-card"
import { StatusBadge } from "@/components/status-badge"
import { useCallback } from "react"
import { Link, useParams } from "react-router-dom"
import { RiArrowLeftLine, RiPhoneLine } from "@remixicon/react"
import {
  getMember,
  joinedDate,
  memberStatus,
} from "@/api/members"
import {
  LoadingSpinner,
  RequestError,
  SampleNotice,
} from "@/components/request-states"
import { Button } from "@/components/ui/button"
import { useRequest } from "@/hooks/use-request"
import { useI18n } from "@/i18n/i18n-context"
import { ApiError } from "@/lib/api"
import { formatDate } from "@/lib/format"
import { MemberFines } from "@/pages/fines/member-fines"
import { MemberActions } from "@/pages/members/member-actions"
import { MemberFigures } from "@/pages/members/member-figures"
import {
  MEMBER_STATUS_KEYS,
  MEMBER_STATUS_TONE,
} from "@/pages/members/member-status"
import { RoleBadge } from "@/pages/members/members-table"

function BackLink() {
  const { t } = useI18n()

  return (
    <Link
      to="/members"
      className="inline-flex min-h-11 items-center gap-2 text-sm text-brand"
    >
      <RiArrowLeftLine className="size-4" aria-hidden="true" />
      {t("members.title")}
    </Link>
  )
}

export function MemberDetailsPage() {
  const { memberId = "" } = useParams()
  const { t, locale } = useI18n()
  const load = useCallback(() => getMember(memberId), [memberId])
  const { data: member, error, loading, reload } = useRequest(load)

  if (error instanceof ApiError && error.status === 404) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">{t("members.notFound")}</h1>
        <Link to="/members" className="text-brand underline underline-offset-4">
          {t("members.backToList")}
        </Link>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <BackLink />
        <RequestError error={error} onRetry={reload} />
      </div>
    )
  }

  if (!member || loading) {
    return (
      <div className="space-y-4">
        <BackLink />
        <LoadingSpinner />
      </div>
    )
  }

  const status = memberStatus(member)
  const details = [
    [t("members.email"), member.email ?? t("members.notGiven")],
    [t("members.phone"), member.phone],
    [t("members.nationalId"), String(member.national_id_number)],
    [t("members.joined"), formatDate(joinedDate(member), locale)],
  ]

  return (
    <div className="space-y-6">
      <BackLink />
      <SampleNotice />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Initials name={member.member_name} />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {member.member_name}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <RoleBadge role={member.role} />
              <StatusBadge tone={MEMBER_STATUS_TONE[status]}>
                {t(MEMBER_STATUS_KEYS[status])}
              </StatusBadge>
            </p>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Button
            variant="outline"
            render={<Link to={`/statements?member=${member.member_id}`} />}
            nativeButton={false}
          >
            {t("statements.view")}
          </Button>
          <Button
            variant="outline"
            render={<a href={`tel:${member.phone}`} />}
            nativeButton={false}
          >
            <RiPhoneLine aria-hidden="true" />
            {t("members.call")}
          </Button>
          <MemberActions member={member} onChanged={reload} />
        </div>
      </div>
      <MemberFigures memberId={member.member_id} />
      <SectionCard title={t("members.details")}>
        <dl className="grid gap-6 sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="mt-2 font-medium break-all">{value}</dd>
            </div>
          ))}
        </dl>
      </SectionCard>
      <MemberFines memberId={member.member_id} />
    </div>
  )
}
