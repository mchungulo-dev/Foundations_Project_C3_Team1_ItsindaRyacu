import { useCallback, useState } from "react"
import { RiAddLine, RiSearchLine } from "@remixicon/react"
import { getFines } from "@/api/fines"
import { getGroup } from "@/api/group"
import { getMeetings } from "@/api/meetings"
import { getMemberPicker } from "@/api/members"
import { AllMonthsButton, MonthSwitch } from "@/components/month-switch"
import { Notice } from "@/components/notice"
import { PillGroup } from "@/components/pill-group"
import {
  LoadingSpinner,
  RequestError,
  SampleNotice,
} from "@/components/request-states"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useSession } from "@/context/session-context"
import { useRequest } from "@/hooks/use-request"
import { useI18n } from "@/i18n/i18n-context"
import { formatMoney, getToday } from "@/lib/format"
import { can } from "@/lib/permissions"
import { FineCard } from "@/pages/fines/fine-card"
import { FineTable } from "@/pages/fines/fine-table"
import { IssueFineDialog } from "@/pages/fines/issue-fine"
import { MemberTotals } from "@/pages/fines/member-totals"

const PAGE_SIZE = 20

export function FinesPage() {
  const { session } = useSession()
  const { t, locale } = useI18n()
  const role = session?.user.role
  const wholeGroup = can("viewGroupFigures", role)
  const canIssue = can("issueFine", role)
  const [tab, setTab] = useState("fines")
  const [status, setStatus] = useState("all")
  const [search, setSearch] = useState("")
  const [month, setMonth] = useState("")
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [issuing, setIssuing] = useState(false)
  const [notice, setNotice] = useState("")
  const load = useCallback(async () => {
    const fines = await getFines()
    if (!canIssue) {
      return { fines, members: [], meetings: [], group: null }
    }
    const [members, meetings, group] = await Promise.all([
      getMemberPicker(),
      getMeetings(),
      getGroup(),
    ])
    return { fines, members, meetings, group }
  }, [canIssue])
  const { data, error, reload } = useRequest(load)

  if (error) {
    return <RequestError error={error} onRetry={reload} />
  }
  if (!data) {
    return <LoadingSpinner />
  }
  const { fines, members, meetings, group } = data
  const money = (amount: number) => formatMoney(amount, locale)
  const sum = (rows: typeof fines) =>
    rows.reduce((total, fine) => total + fine.fine_amount, 0)
  const unpaid = fines.filter((fine) => !fine.is_paid)
  const thisMonth = `${getToday().slice(0, 7)}-01`
  const first =
    fines.map((fine) => fine.created_at.slice(0, 7)).sort()[0] ??
    thisMonth.slice(0, 7)
  const needle = search.trim().toLowerCase()
  const shown = fines
    .filter(
      (fine) =>
        (status === "all" || (status === "paid") === Boolean(fine.is_paid)) &&
        (!needle || fine.member_name.toLowerCase().includes(needle)) &&
        (!month || fine.created_at.startsWith(month))
    )
    .sort((a, b) => Number(a.is_paid) - Number(b.is_paid))
  const visible = shown.slice(0, limit)

  function change(next: () => void) {
    next()
    setLimit(PAGE_SIZE)
  }

  return (
    <div className="space-y-6">
      <SampleNotice />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("fines.title")}
        </h1>
        {canIssue && group ? (
          <Button className="w-full sm:w-auto" onClick={() => setIssuing(true)}>
            <RiAddLine aria-hidden="true" />
            {t("fines.issue")}
          </Button>
        ) : null}
      </div>
      {notice ? (
        <Notice message={notice} onClose={() => setNotice("")} />
      ) : null}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
        <StatCard
          highlight
          className="col-span-2 xl:col-span-1"
          label={t(wholeGroup ? "fines.unpaidTotal" : "fines.youOwe")}
          value={money(sum(unpaid))}
          note={t("fines.unpaidCount", { count: unpaid.length })}
          action={
            unpaid.length > 0
              ? {
                  label: t("fines.showUnpaid"),
                  onClick: () => {
                    setTab("fines")
                    change(() => setStatus("unpaid"))
                  },
                }
              : undefined
          }
        />
        <StatCard
          label={t("fines.paidTotal")}
          value={money(sum(fines.filter((fine) => fine.is_paid)))}
        />
        {wholeGroup ? (
          <StatCard
            label={t("fines.issuedTotal")}
            value={money(sum(fines))}
            note={t("fines.issuedCount", { count: fines.length })}
          />
        ) : null}
      </div>
      {wholeGroup ? (
        <PillGroup
          label={t("fines.title")}
          value={tab}
          onChange={setTab}
          items={[
            { value: "fines", label: t("fines.tab") },
            { value: "members", label: t("fines.tabMembers") },
          ]}
        />
      ) : null}
      {tab === "members" && wholeGroup ? (
        <MemberTotals fines={fines} />
      ) : (
        <>
          <div className="space-y-3">
            {wholeGroup ? (
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative lg:flex-1">
                  <RiSearchLine
                    className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    type="search"
                    aria-label={t("savings.searchMember")}
                    placeholder={t("savings.searchMember")}
                    className="pl-10"
                    value={search}
                    onChange={(event) =>
                      change(() => setSearch(event.target.value))
                    }
                  />
                </div>
                <MonthSwitch
                  value={`${month || thisMonth.slice(0, 7)}-01`}
                  first={`${first}-01`}
                  last={thisMonth}
                  disabled={month === ""}
                  onChange={(value) =>
                    change(() => setMonth(value.slice(0, 7)))
                  }
                />
              </div>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <PillGroup
                label={t("savings.colStatus")}
                value={status}
                onChange={(value) => change(() => setStatus(value))}
                items={[
                  {
                    value: "all",
                    label: `${t("savings.statusAll")} · ${fines.length}`,
                  },
                  {
                    value: "unpaid",
                    label: `${t("fines.statusUnpaid")} · ${unpaid.length}`,
                  },
                  {
                    value: "paid",
                    label: `${t("fines.statusPaid")} · ${fines.length - unpaid.length}`,
                  },
                ]}
              />
              {wholeGroup ? (
                <AllMonthsButton
                  active={month === ""}
                  onClick={() =>
                    change(() =>
                      setMonth(month === "" ? thisMonth.slice(0, 7) : "")
                    )
                  }
                />
              ) : null}
            </div>
          </div>
          {shown.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                {t(wholeGroup ? "fines.empty" : "fines.emptyMine")}
              </CardContent>
            </Card>
          ) : (
            <>
              {wholeGroup ? (
                <FineTable fines={visible} onChanged={reload} />
              ) : null}
              <div
                className={
                  wholeGroup
                    ? "grid gap-4 md:grid-cols-2 xl:hidden"
                    : "grid gap-4 md:grid-cols-2"
                }
              >
                {visible.map((fine) => (
                  <FineCard
                    key={fine.fine_id}
                    fine={fine}
                    showMember={wholeGroup}
                    onChanged={reload}
                  />
                ))}
              </div>
              {shown.length > limit ? (
                <Button
                  variant="outline"
                  className="w-full sm:mx-auto sm:flex sm:w-auto"
                  onClick={() => setLimit(limit + PAGE_SIZE)}
                >
                  {t("savings.showMore")}
                </Button>
              ) : null}
            </>
          )}
        </>
      )}
      {group ? (
        <IssueFineDialog
          open={issuing}
          onOpenChange={setIssuing}
          members={members}
          meetings={meetings}
          group={group}
          onIssued={() => {
            setNotice(t("fines.issued"))
            reload()
          }}
        />
      ) : null}
    </div>
  )
}
