import { useState } from "react"
import { RiAddLine, RiSearchLine } from "@remixicon/react"
import { getMembers, memberStatus } from "@/api/members"
import type { Member } from "@/api/types"
import { Notice } from "@/components/notice"
import { PillGroup } from "@/components/pill-group"
import {
  LoadingSpinner,
  RequestError,
  SampleNotice,
} from "@/components/request-states"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useSession } from "@/context/session-context"
import { useRequest } from "@/hooks/use-request"
import { useI18n } from "@/i18n/i18n-context"
import { can } from "@/lib/permissions"
import { normalizePhone } from "@/lib/validation"
import { AddMemberDialog } from "@/pages/members/add-member"
import { EditMemberDialog } from "@/pages/members/edit-member"
import { MembersTable } from "@/pages/members/members-table"

const ROLE_ORDER = ["admin", "chairperson", "treasurer", "secretary", "member"]

function roleRank(role: string) {
  const rank = ROLE_ORDER.indexOf(role)
  return rank === -1 ? ROLE_ORDER.length : rank
}

const FILTERS: Record<string, (member: Member) => boolean> = {
  all: () => true,
  officers: (member) =>
    member.role !== "member" && memberStatus(member) !== "Inactive",
  members: (member) =>
    member.role === "member" && memberStatus(member) !== "Inactive",
  inactive: (member) => memberStatus(member) === "Inactive",
}

export function MembersPage() {
  const { session } = useSession()
  const { t } = useI18n()
  const { data, error, loading, reload } = useRequest(getMembers)
  const members = data ?? []
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Member | null>(null)
  const [addedName, setAddedName] = useState("")
  const role = session?.user.role

  const query = search.trim().toLowerCase()
  const phoneQuery = normalizePhone(query)
  const visibleMembers = [...members]
    .filter(
      (member) =>
        FILTERS[filter](member) &&
        (member.member_name.toLowerCase().includes(query) ||
          (phoneQuery.length > 0 &&
            normalizePhone(member.phone).includes(phoneQuery)))
    )
    .sort(
      (a, b) =>
        roleRank(a.role) - roleRank(b.role) ||
        a.member_name.localeCompare(b.member_name)
    )
  const count = (key: string) => members.filter(FILTERS[key]).length

  return (
    <div className="space-y-6">
      <SampleNotice />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("members.title")}
          </h1>
          {data ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {t("members.count", { count: members.length })}
            </p>
          ) : null}
        </div>
        {can("addMember", role) ? (
          <Button onClick={() => setAdding(true)} className="w-full sm:w-auto">
            <RiAddLine aria-hidden="true" />
            {t("members.add")}
          </Button>
        ) : null}
      </div>
      {addedName ? (
        <Notice
          message={t("members.added", { name: addedName })}
          onClose={() => setAddedName("")}
        />
      ) : null}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <PillGroup
          label={t("members.title")}
          value={filter}
          onChange={setFilter}
          items={[
            {
              value: "all",
              label: `${t("savings.statusAll")} · ${count("all")}`,
            },
            {
              value: "officers",
              label: `${t("members.filterOfficers")} · ${count("officers")}`,
            },
            {
              value: "members",
              label: `${t("members.filterMembers")} · ${count("members")}`,
            },
            {
              value: "inactive",
              label: `${t("members.statusInactive")} · ${count("inactive")}`,
            },
          ]}
        />
        <div className="relative lg:w-80">
          <RiSearchLine
            className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            aria-label={t("members.search")}
            placeholder={t("members.searchPlaceholder")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      {error ? (
        <RequestError error={error} onRetry={reload} />
      ) : !data && loading ? (
        <LoadingSpinner />
      ) : visibleMembers.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {members.length === 0
              ? t("members.emptyNone")
              : t("members.emptyFiltered")}
          </CardContent>
        </Card>
      ) : (
        <MembersTable
          members={visibleMembers}
          canEdit={can("editMember", role)}
          onEdit={setEditing}
        />
      )}
      <AddMemberDialog
        open={adding}
        onOpenChange={setAdding}
        onAdded={(name) => {
          setAddedName(name)
          setSearch("")
          setFilter("all")
          reload()
        }}
      />
      {editing ? (
        <EditMemberDialog
          open
          onOpenChange={(open) => !open && setEditing(null)}
          member={editing}
          onSaved={reload}
        />
      ) : null}
    </div>
  )
}
