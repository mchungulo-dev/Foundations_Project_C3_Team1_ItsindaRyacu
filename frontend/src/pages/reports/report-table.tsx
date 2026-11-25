import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useI18n } from "@/i18n/i18n-context"
import { formatDate, formatMoney } from "@/lib/format"
import type { Cell, Column, ReportData } from "@/pages/reports/build-report"

export function ReportTable({ report }: { report: ReportData }) {
  const { t, locale } = useI18n()

  function show(value: Cell, column: Column) {
    if (value === "") {
      return ""
    }
    if (column.kind === "money" && typeof value === "number") {
      return formatMoney(value, locale)
    }
    if (column.kind === "date" && /^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
      return formatDate(String(value), locale)
    }
    return String(value)
  }

  if (report.rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {t("reports.empty")}
        </CardContent>
      </Card>
    )
  }
  const rows = report.footer ? [...report.rows, report.footer] : report.rows

  return (
    <>
      <ul className="space-y-3 md:hidden print:hidden">
        {rows.map((row, index) => (
          <li
            key={index}
            className="space-y-1 rounded-xl border border-border bg-card p-4"
          >
            <p className="font-medium">{show(row[0], report.columns[0])}</p>
            {row.slice(1).map((value, position) =>
              value === "" ? null : (
                <p
                  key={position}
                  className="flex justify-between gap-3 text-sm"
                >
                  <span className="text-muted-foreground">
                    {report.columns[position + 1].label}
                  </span>
                  <span>{show(value, report.columns[position + 1])}</span>
                </p>
              )
            )}
          </li>
        ))}
      </ul>
      <Card className="hidden py-0 md:block print:block">
        <Table>
          <TableHeader>
            <TableRow>
              {report.columns.map((column) => (
                <TableHead
                  key={column.label}
                  scope="col"
                  className={column.kind === "money" ? "text-right" : undefined}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                key={index}
                className={
                  report.footer && index === rows.length - 1
                    ? "font-semibold"
                    : undefined
                }
              >
                {row.map((value, position) => (
                  <TableCell
                    key={position}
                    className={
                      report.columns[position].kind === "money"
                        ? "text-right tabular-nums"
                        : undefined
                    }
                  >
                    {show(value, report.columns[position])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  )
}
