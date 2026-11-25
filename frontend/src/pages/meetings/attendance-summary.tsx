import { getAttendanceSummary } from "@/api/meetings"
import type { AttendanceSummaryRow } from "@/api/types"
import { Initials, ListRow, RowList } from "@/components/list-row"
import { ProgressBar } from "@/components/progress-bar"
import { RemindLinks } from "@/components/remind-links"
import { SectionCard } from "@/components/section-card"
import { StatusBadge } from "@/components/status-badge"
import { Card } from "@/components/ui/card"
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
import { can } from "@/lib/permissions"
import { percentOf } from "@/lib/savings-totals"

const total = (row: AttendanceSummaryRow) =>
  row.present + row.late + row.absent + row.excused
const rate = (row: AttendanceSummaryRow) =>
  percentOf(row.present + row.late, total(row))

export function AttendanceSummary() {
  const { session } = useSession()
  const { t } = useI18n()
  const { data } = useRequest(getAttendanceSummary)
  const wholeGroup = can("viewGroupFigures", session?.user.role)
  const rows = (data ?? []).filter((row) => total(row) > 0)

  if (rows.length === 0) {
    return null
  }

  if (!wholeGroup) {
    const own = rows[0]
    return (
      <SectionCard title={t("meetings.summaryMine")}>
        <div className="space-y-4">
          <ProgressBar value={rate(own)} label={t("meetings.myRate")} />
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            {(
              [
                ["meetings.statusPresent", own.present],
                ["meetings.statusLate", own.late],
                ["meetings.statusAbsent", own.absent],
                ["meetings.statusExcused", own.excused],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <dt className="text-muted-foreground">{t(label)}</dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </SectionCard>
    )
  }

  function remind(row: AttendanceSummaryRow) {
    return row.recent_absent >= 2 ? (
      <RemindLinks
        memberId={row.member_id}
        name={row.member_name}
        kind="reminder.missed"
      />
    ) : null
  }

  function missed(row: AttendanceSummaryRow) {
    return row.recent_absent >= 2 ? (
      <StatusBadge tone="bad">
        {t("meetings.missed", { count: row.recent_absent })}
      </StatusBadge>
    ) : undefined
  }

  return (
    <>
      <div className="md:hidden">
        <RowList className="rounded-xl border border-border bg-card p-4">
          {rows.map((row) => (
            <ListRow
              key={row.member_id}
              leading={<Initials name={row.member_name} />}
              title={row.member_name}
              subtitle={t("meetings.summaryRow", {
                present: row.present,
                late: row.late,
                absent: row.absent,
                excused: row.excused,
              })}
              value={`${rate(row)}%`}
              note={missed(row)}
            >
              {remind(row)}
            </ListRow>
          ))}
        </RowList>
      </div>
      <Card className="hidden py-0 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">{t("savings.member")}</TableHead>
              <TableHead scope="col" className="text-right">
                {t("meetings.statusPresent")}
              </TableHead>
              <TableHead scope="col" className="text-right">
                {t("meetings.statusLate")}
              </TableHead>
              <TableHead scope="col" className="text-right">
                {t("meetings.statusAbsent")}
              </TableHead>
              <TableHead scope="col" className="text-right">
                {t("meetings.statusExcused")}
              </TableHead>
              <TableHead scope="col">{t("meetings.colRate")}</TableHead>
              <TableHead scope="col">
                <span className="sr-only">{t("savings.colActions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.member_id}>
                <TableCell className="font-medium">{row.member_name}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.present}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.late}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.absent}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.excused}
                </TableCell>
                <TableCell>
                  <div className="flex w-36 items-center gap-3">
                    <div className="flex-1">
                      <ProgressBar
                        value={rate(row)}
                        label={t("meetings.colRate")}
                      />
                    </div>
                    <span className="w-10 text-right text-sm text-muted-foreground tabular-nums">
                      {rate(row)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-end gap-2">
                    {missed(row)}
                    {remind(row)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  )
}
