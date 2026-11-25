import { useState } from "react"
import { RiCalendarLine } from "@remixicon/react"
import { closeCycle, getCycles } from "@/api/cycles"
import { getGroup } from "@/api/group"
import { getSavings } from "@/api/savings"
import type { Cycle, Group, Saving } from "@/api/types"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { ProgressBar } from "@/components/progress-bar"
import {
  LoadingSpinner,
  RequestError,
  SampleNotice,
} from "@/components/request-states"
import { SectionCard } from "@/components/section-card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSession } from "@/context/session-context"
import { useRequest } from "@/hooks/use-request"
import { useI18n } from "@/i18n/i18n-context"
import { cycleProgress, daysBetween } from "@/lib/cycle-dates"
import { formatDate, formatMoney, getToday } from "@/lib/format"
import { can } from "@/lib/permissions"
import { totalOf } from "@/lib/savings-totals"
import { CreateCycleDialog } from "@/pages/cycles/create-cycle"

const loadCyclesPage = () =>
  Promise.all([getCycles(), getGroup(), getSavings()])

export function CyclesPage() {
  const { data, error, reload } = useRequest(loadCyclesPage)

  if (error) {
    return <RequestError error={error} onRetry={reload} />
  }
  if (!data) {
    return <LoadingSpinner />
  }
  const [cycles, group, overview] = data
  return (
    <CyclesView
      cycles={cycles}
      group={group}
      savings={overview.contributions}
      onChanged={reload}
    />
  )
}

type CyclesViewProps = {
  cycles: Cycle[]
  group: Group
  savings: Saving[]
  onChanged: () => void
}

function CyclesView({ cycles, group, savings, onChanged }: CyclesViewProps) {
  const { session } = useSession()
  const { t, locale } = useI18n()
  const [creating, setCreating] = useState(false)
  const [closing, setClosing] = useState(false)
  const role = session?.user.role
  const isAdmin = can("manageCycles", role)
  const wholeGroup = can("viewGroupFigures", role)
  const active = cycles.find((cycle) => cycle.status === "active")
  const history = cycles.filter((cycle) => cycle.status === "closed")
  const pending = savings.filter((item) => item.status === "pending").length
  const saved = (cycle: Cycle) =>
    totalOf(savings.filter((item) => item.cycle_id === cycle.cycle_id))
  const period = (cycle: Cycle) =>
    `${formatDate(cycle.start_date, locale)} – ${formatDate(cycle.end_date, locale)}`

  return (
    <div className="space-y-6">
      <SampleNotice />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("cycles.title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("cycles.subtitle")}
          </p>
        </div>
        {isAdmin && !active ? (
          <Button
            onClick={() => setCreating(true)}
            className="w-full sm:w-auto"
          >
            {t("cycles.start")}
          </Button>
        ) : null}
      </div>
      {active ? (
        <ActiveCycle
          cycle={active}
          period={period(active)}
          saved={wholeGroup ? saved(active) : null}
          canClose={isAdmin}
          onClose={() => setClosing(true)}
        />
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <RiCalendarLine
              className="mx-auto mb-3 size-7 text-muted-foreground"
              aria-hidden="true"
            />
            <h2 className="text-base font-semibold">{t("cycles.none")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(isAdmin ? "cycles.noneAdmin" : "cycles.noneOthers")}
            </p>
          </CardContent>
        </Card>
      )}
      <h2 className="text-base font-semibold">{t("cycles.history")}</h2>
      {history.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {t("cycles.historyEmpty")}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:hidden">
            {history.map((cycle) => (
              <Card key={cycle.cycle_id}>
                <CardContent className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{period(cycle)}</p>
                    <StatusBadge tone="good">{t("cycles.closed")}</StatusBadge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatMoney(cycle.contribution_amount, locale)} ·{" "}
                    {cycle.default_interest_rate}%
                    {wholeGroup
                      ? ` · ${formatMoney(saved(cycle), locale)}`
                      : ""}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="hidden py-0 xl:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">{t("cycles.period")}</TableHead>
                  <TableHead scope="col" className="text-right">
                    {t("cycles.contribution")}
                  </TableHead>
                  <TableHead scope="col" className="text-right">
                    {t("cycles.interest")}
                  </TableHead>
                  {wholeGroup ? (
                    <TableHead scope="col" className="text-right">
                      {t("cycles.colSaved")}
                    </TableHead>
                  ) : null}
                  <TableHead scope="col">{t("savings.colStatus")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((cycle) => (
                  <TableRow key={cycle.cycle_id}>
                    <TableCell className="font-medium">
                      {period(cycle)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(cycle.contribution_amount, locale)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {cycle.default_interest_rate}%
                    </TableCell>
                    {wholeGroup ? (
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatMoney(saved(cycle), locale)}
                      </TableCell>
                    ) : null}
                    <TableCell>
                      <StatusBadge tone="good">
                        {t("cycles.closed")}
                      </StatusBadge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
      <CreateCycleDialog
        open={creating}
        onOpenChange={setCreating}
        defaultAmount={group.savings_amount}
        onCreated={onChanged}
      />
      {active ? (
        <ConfirmDialog
          open={closing}
          onOpenChange={setClosing}
          title={t("cycles.closeTitle")}
          body={[
            t("cycles.closeBody"),
            pending > 0 ? t("cycles.closePending", { count: pending }) : "",
          ]
            .filter(Boolean)
            .join(" ")}
          confirmLabel={t("cycles.closeConfirm")}
          destructive
          onConfirm={async () => {
            await closeCycle(active.cycle_id)
            onChanged()
          }}
        />
      ) : null}
    </div>
  )
}

type ActiveCycleProps = {
  cycle: Cycle
  period: string
  saved: number | null
  canClose: boolean
  onClose: () => void
}

function ActiveCycle({
  cycle,
  period,
  saved,
  canClose,
  onClose,
}: ActiveCycleProps) {
  const { t, locale } = useI18n()
  const today = getToday()
  const left = daysBetween(today, cycle.end_date)
  const percent = cycleProgress(cycle.start_date, cycle.end_date, today)
  const timeLeft =
    left > 0
      ? t("cycles.daysLeft", { count: left })
      : left === 0
        ? t("cycles.endsToday")
        : t("cycles.overdue", { count: -left })
  const details: [string, string][] = [
    [t("cycles.period"), period],
    [t("cycles.contribution"), formatMoney(cycle.contribution_amount, locale)],
    [t("cycles.interest"), `${cycle.default_interest_rate}%`],
    ...(saved === null
      ? []
      : [[t("cycles.saved"), formatMoney(saved, locale)] as [string, string]]),
  ]

  return (
    <SectionCard
      title={t("cycles.activeTitle")}
      action={<StatusBadge tone="good">{timeLeft}</StatusBadge>}
    >
      <div className="space-y-6">
        <dl className="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-4">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="mt-2 text-lg font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <ProgressBar value={percent} label={t("cycles.progress")} />
        {canClose ? (
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            {t("cycles.close")}
          </Button>
        ) : null}
      </div>
    </SectionCard>
  )
}
