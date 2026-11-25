import type { Fine } from "@/api/types"
import { Initials, ListRow, RowList } from "@/components/list-row"
import { RemindLinks } from "@/components/remind-links"
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
import { useI18n } from "@/i18n/i18n-context"
import { formatMoney } from "@/lib/format"

type Total = {
  memberId: number
  name: string
  count: number
  unpaid: number
  paid: number
}

export function MemberTotals({ fines }: { fines: Fine[] }) {
  const { t, locale } = useI18n()
  const money = (amount: number) => formatMoney(amount, locale)
  const totals = new Map<number, Total>()
  for (const fine of fines) {
    const row = totals.get(fine.member_id) ?? {
      memberId: fine.member_id,
      name: fine.member_name,
      count: 0,
      unpaid: 0,
      paid: 0,
    }
    if (fine.is_paid) {
      row.paid += fine.fine_amount
    } else {
      row.unpaid += fine.fine_amount
      row.count += 1
    }
    totals.set(fine.member_id, row)
  }
  const rows = [...totals.values()].sort(
    (a, b) => b.unpaid - a.unpaid || a.name.localeCompare(b.name)
  )

  function remind(row: Total) {
    return row.unpaid > 0 ? (
      <RemindLinks
        memberId={row.memberId}
        name={row.name}
        kind="reminder.fine"
        params={{
          amount: money(row.unpaid),
          reason: t("fines.unpaidCount", { count: row.count }),
        }}
      />
    ) : null
  }

  return (
    <>
      <div className="md:hidden">
        <RowList className="rounded-xl border border-border bg-card p-4">
          {rows.map((row) => (
            <ListRow
              key={row.memberId}
              leading={<Initials name={row.name} />}
              title={row.name}
              subtitle={
                row.count > 0
                  ? t("fines.unpaidCount", { count: row.count })
                  : undefined
              }
              value={row.unpaid > 0 ? money(row.unpaid) : undefined}
              note={
                row.unpaid === 0 ? (
                  <StatusBadge tone="good">{t("fines.statusPaid")}</StatusBadge>
                ) : undefined
              }
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
              <TableHead scope="col">{t("fines.member")}</TableHead>
              <TableHead scope="col" className="text-right">
                {t("fines.colUnpaid")}
              </TableHead>
              <TableHead scope="col" className="text-right">
                {t("fines.colPaid")}
              </TableHead>
              <TableHead scope="col">
                <span className="sr-only">{t("savings.colActions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.memberId}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.unpaid > 0 ? (
                    <>
                      <span className="font-semibold">{money(row.unpaid)}</span>
                      <p className="text-xs text-muted-foreground">
                        {t("fines.unpaidCount", { count: row.count })}
                      </p>
                    </>
                  ) : (
                    <span className="text-muted-foreground">–</span>
                  )}
                </TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">
                  {row.paid > 0 ? money(row.paid) : "–"}
                </TableCell>
                <TableCell>{remind(row)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  )
}
