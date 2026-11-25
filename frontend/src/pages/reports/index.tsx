import { useCallback, useState } from "react"
import { RiDownloadLine, RiPrinterLine } from "@remixicon/react"
import { getCycles } from "@/api/cycles"
import { getFines } from "@/api/fines"
import { getLoans, getRepayments } from "@/api/loans"
import { getAttendanceSummary } from "@/api/meetings"
import { getMemberPicker } from "@/api/members"
import { getSavings } from "@/api/savings"
import { PillGroup } from "@/components/pill-group"
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
import { downloadCsv, fileName, toCsv } from "@/lib/csv"
import { formatDate } from "@/lib/format"
import {
  REPORT_KEYS,
  buildReport,
  type ReportKey,
} from "@/pages/reports/build-report"
import { ReportTable } from "@/pages/reports/report-table"

async function loadReports(cycleId: number | undefined) {
  const [cycles, members, loans, repayments, fines, attendance] =
    await Promise.all([
      getCycles(),
      getMemberPicker(),
      getLoans(),
      getRepayments(),
      getFines(),
      getAttendanceSummary(),
    ])
  const chosen =
    cycles.find((item) => item.cycle_id === cycleId) ??
    cycles.find((item) => item.status === "active") ??
    cycles[0]
  const savings = chosen
    ? (await getSavings(chosen.cycle_id)).contributions
    : []
  return {
    cycles,
    chosen,
    members,
    loans,
    repayments,
    fines,
    attendance,
    savings,
  }
}

export function ReportsPage() {
  const { session } = useSession()
  const { t, locale } = useI18n()
  const [cycleId, setCycleId] = useState<number | undefined>(undefined)
  const [key, setKey] = useState<ReportKey>("byMember")
  const load = useCallback(() => loadReports(cycleId), [cycleId])
  const { data, error, reload } = useRequest(load)

  if (error) {
    return <RequestError error={error} onRetry={reload} />
  }
  if (!data) {
    return <LoadingSpinner />
  }
  const { cycles, chosen } = data
  const range = chosen
    ? t("statements.range", {
        from: formatDate(chosen.start_date, locale),
        to: formatDate(chosen.end_date, locale),
      })
    : ""
  const report = chosen
    ? buildReport(key, { ...data, cycle: chosen }, t, locale)
    : null
  const title = t(`reports.${key}`)

  return (
    <div className="print-area space-y-6">
      <div className="no-print space-y-6">
        <SampleNotice />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("reports.title")}
          </h1>
          {report && chosen ? (
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button variant="outline" onClick={() => window.print()}>
                <RiPrinterLine aria-hidden="true" />
                {t("reports.print")}
              </Button>
              <Button
                variant="outline"
                disabled={report.rows.length === 0}
                onClick={() =>
                  downloadCsv(
                    fileName(
                      session?.user.group_name ?? "group",
                      key,
                      chosen.start_date
                    ),
                    toCsv(
                      report.columns.map((column) => column.label),
                      report.footer
                        ? [...report.rows, report.footer]
                        : report.rows
                    )
                  )
                }
              >
                <RiDownloadLine aria-hidden="true" />
                {t("reports.csv")}
              </Button>
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <PillGroup
            wrap
            className="lg:flex-1"
            label={t("reports.title")}
            value={key}
            onChange={(value) => setKey(value as ReportKey)}
            items={REPORT_KEYS.map((item) => ({
              value: item,
              label: t(`reports.${item}`),
            }))}
          />
          {cycles.length > 0 ? (
            <div className="lg:w-72">
              <SelectField
                id="report-cycle"
                label={t("reports.cycle")}
                value={String(chosen?.cycle_id ?? "")}
                onChange={(event) => setCycleId(Number(event.target.value))}
                options={cycles.map((cycle) => ({
                  value: String(cycle.cycle_id),
                  label: `${formatDate(cycle.start_date, locale)} – ${formatDate(cycle.end_date, locale)}`,
                }))}
              />
            </div>
          ) : null}
        </div>
      </div>
      <PrintHeader title={title} subtitle={range} />
      {report && chosen ? (
        <>
          <ReportTable report={report} />
          <p className="text-sm text-muted-foreground">
            {key === "attendance"
              ? t("reports.allMeetings")
              : key === "byMember" || key === "overTime"
                ? t("reports.onlyVerified")
                : ""}
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t("statements.noCycle")}
        </p>
      )}
    </div>
  )
}
