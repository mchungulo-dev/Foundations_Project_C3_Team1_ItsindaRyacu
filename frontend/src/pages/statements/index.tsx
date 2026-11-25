import { useCallback, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { RiPrinterLine } from "@remixicon/react"
import { getCycles } from "@/api/cycles"
import { getFines } from "@/api/fines"
import { getLoans, getRepayments } from "@/api/loans"
import { getMemberPicker } from "@/api/members"
import { getSavings } from "@/api/savings"
import { getShareOut } from "@/api/share-out"
import { Initials } from "@/components/list-row"
import { PrintHeader } from "@/components/print-header"
import {
  LoadingSpinner,
  RequestError,
  SampleNotice,
} from "@/components/request-states"
import { SelectField } from "@/components/select-field"
import { Button } from "@/components/ui/button"
import { useSession } from "@/context/session-context"
import { useRequest } from "@/hooks/use-request"
import { useI18n } from "@/i18n/i18n-context"
import { formatDate } from "@/lib/format"
import { can } from "@/lib/permissions"
import { buildStatement } from "@/lib/statement"
import { StatementView } from "@/pages/statements/statement-view"

async function loadStatement(cycleId: number | undefined, pickMember: boolean) {
  const [cycles, members, loans, repayments, fines] = await Promise.all([
    getCycles(),
    pickMember ? getMemberPicker() : Promise.resolve([]),
    getLoans(),
    getRepayments(),
    getFines(),
  ])
  const chosen =
    cycles.find((item) => item.cycle_id === cycleId) ??
    cycles.find((item) => item.status === "active") ??
    cycles[0]
  const savings = chosen
    ? (await getSavings(chosen.cycle_id)).contributions
    : []
  const shareOut = chosen ? await getShareOut(chosen.cycle_id) : null
  return {
    cycles,
    chosen,
    members,
    loans,
    repayments,
    fines,
    savings,
    shareOut,
  }
}

export function StatementsPage() {
  const { session } = useSession()
  const { t, locale } = useI18n()
  const [params, setParams] = useSearchParams()
  const pickMember = can("viewGroupFigures", session?.user.role)
  const [cycleId, setCycleId] = useState<number | undefined>(undefined)
  const load = useCallback(
    () => loadStatement(cycleId, pickMember),
    [cycleId, pickMember]
  )
  const { data, error, reload } = useRequest(load)

  if (error) {
    return <RequestError error={error} onRetry={reload} />
  }
  if (!data) {
    return <LoadingSpinner />
  }
  const { cycles, chosen, members, shareOut, ...rest } = data
  const ownId = session?.user.member_id ?? 0
  const requested = Number(params.get("member"))
  const memberId = pickMember && requested ? requested : ownId
  const name = pickMember
    ? (members.find((item) => item.member_id === memberId)?.member_name ??
      session?.user.member_name ??
      "")
    : (session?.user.member_name ?? "")
  const range = chosen
    ? t("statements.range", {
        from: formatDate(chosen.start_date, locale),
        to: formatDate(chosen.end_date, locale),
      })
    : ""

  return (
    <div className="print-area space-y-6">
      <div className="no-print space-y-6">
        <SampleNotice />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("statements.title")}
          </h1>
          {chosen ? (
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => window.print()}
            >
              <RiPrinterLine aria-hidden="true" />
              {t("statements.print")}
            </Button>
          ) : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {pickMember ? (
            <SelectField
              id="statement-member"
              label={t("statements.member")}
              value={String(memberId)}
              onChange={(event) => setParams({ member: event.target.value })}
              options={members.map((item) => ({
                value: String(item.member_id),
                label: item.member_name,
              }))}
            />
          ) : null}
          {cycles.length > 0 ? (
            <SelectField
              id="statement-cycle"
              label={t("statements.cycle")}
              value={String(chosen?.cycle_id ?? "")}
              onChange={(event) => setCycleId(Number(event.target.value))}
              options={cycles.map((cycle) => ({
                value: String(cycle.cycle_id),
                label: `${formatDate(cycle.start_date, locale)} – ${formatDate(cycle.end_date, locale)}`,
              }))}
            />
          ) : null}
        </div>
        {chosen ? (
          <div className="flex items-center gap-3">
            <Initials name={name} />
            <div>
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-muted-foreground">{range}</p>
            </div>
          </div>
        ) : null}
      </div>
      {chosen ? (
        <>
          <PrintHeader
            title={t("statements.heading", { name })}
            subtitle={range}
          />
          <StatementView
            statement={buildStatement({ memberId, cycle: chosen, ...rest })}
            shareOut={
              shareOut?.executed
                ? (shareOut.rows.find((row) => row.member_id === memberId) ??
                  null)
                : null
            }
          />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t("statements.noCycle")}
        </p>
      )}
    </div>
  )
}
