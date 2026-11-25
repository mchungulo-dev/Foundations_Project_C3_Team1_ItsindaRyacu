import { useCallback, useState } from "react"
import { RiAddLine } from "@remixicon/react"
import { getInvitations } from "@/api/invitations"
import { getMemberPicker } from "@/api/members"
import type { Invitation } from "@/api/types"
import { Notice } from "@/components/notice"
import { PillGroup } from "@/components/pill-group"
import {
  LoadingSpinner,
  RequestError,
  SampleNotice,
} from "@/components/request-states"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRequest } from "@/hooks/use-request"
import { useI18n } from "@/i18n/i18n-context"
import { CreateInvitationDialog } from "@/pages/invitations/create-invitation"
import { InvitationCard } from "@/pages/invitations/invitation-card"
import { InvitationsTable } from "@/pages/invitations/invitations-table"

const FILTERS: Record<string, (invitation: Invitation) => boolean> = {
  all: () => true,
  pending: (invitation) => invitation.status === "pending",
  accepted: (invitation) => invitation.status === "accepted",
  closed: (invitation) =>
    invitation.status === "expired" || invitation.status === "revoked",
}

export function InvitationsPage() {
  const { t } = useI18n()
  const [creating, setCreating] = useState(false)
  const [notice, setNotice] = useState("")
  const [filter, setFilter] = useState("all")
  const load = useCallback(
    () => Promise.all([getInvitations(), getMemberPicker()]),
    []
  )
  const { data, error, reload } = useRequest(load)

  if (error) {
    return <RequestError error={error} onRetry={reload} />
  }
  if (!data) {
    return <LoadingSpinner />
  }
  const [invitations, members] = data
  const shown = invitations.filter(FILTERS[filter])
  const count = (key: string) => invitations.filter(FILTERS[key]).length

  return (
    <div className="space-y-6">
      <SampleNotice />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("invitations.title")}
        </h1>
        <Button className="w-full sm:w-auto" onClick={() => setCreating(true)}>
          <RiAddLine aria-hidden="true" />
          {t("invitations.create")}
        </Button>
      </div>
      {notice ? (
        <Notice message={notice} onClose={() => setNotice("")} />
      ) : null}
      {invitations.length > 0 ? (
        <PillGroup
          label={t("invitations.title")}
          value={filter}
          onChange={setFilter}
          items={[
            {
              value: "all",
              label: `${t("invitations.filterAll")} · ${count("all")}`,
            },
            {
              value: "pending",
              label: `${t("invitations.filterPending")} · ${count("pending")}`,
            },
            {
              value: "accepted",
              label: `${t("invitations.filterUsed")} · ${count("accepted")}`,
            },
            {
              value: "closed",
              label: `${t("invitations.filterClosed")} · ${count("closed")}`,
            },
          ]}
        />
      ) : null}
      {shown.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {t("invitations.empty")}
          </CardContent>
        </Card>
      ) : (
        <>
          <InvitationsTable invitations={shown} onChanged={reload} />
          <div className="grid gap-4 md:grid-cols-2 xl:hidden">
            {shown.map((invitation) => (
              <InvitationCard
                key={invitation.invitation_id}
                invitation={invitation}
                onChanged={reload}
              />
            ))}
          </div>
        </>
      )}
      <CreateInvitationDialog
        open={creating}
        onOpenChange={setCreating}
        members={members}
        onCreated={() => {
          setNotice(t("invitations.created"))
          reload()
        }}
      />
    </div>
  )
}
