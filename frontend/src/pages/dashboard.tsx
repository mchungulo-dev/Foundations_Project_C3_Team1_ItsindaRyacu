import { RiCalendarLine, RiGroupLine, RiWallet3Line } from "@remixicon/react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSession } from "@/context/session-context"
import {
  demoGroup,
  demoMember,
  demoSummary,
  recentActivity,
  savingsHistory,
  type DemoActivity,
} from "@/data/demo-data"
import { useI18n } from "@/i18n/i18n-context"
import type { MessageKey } from "@/i18n/locales/en"
import { useRoleLabel } from "@/i18n/use-role-label"
import {
  formatDate,
  formatMonth,
  formatMonthYear,
  formatMoney,
} from "@/lib/format"

// The sample activity rows are English text. Until the dashboard reads real
// data (Phase 3), map the known fixture values to translations. Unknown values
// are shown as they are. Remove this when the backend supplies the activity.
const FIXTURE_DESCRIPTIONS: Record<string, MessageKey> = {
  "Monthly savings contribution": "fixture.monthlyContribution",
}
const FIXTURE_STATUSES: Record<string, MessageKey> = {
  Recorded: "fixture.statusRecorded",
}

// savingsHistory labels months as "Jun", "Jul"... Turn them into dates so the
// month name can follow the chosen language.
const MONTH_NUMBERS: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
}
const HISTORY_YEAR = demoSummary.periodDate.slice(0, 4)

function monthToDate(abbreviation: string) {
  return `${HISTORY_YEAR}-${MONTH_NUMBERS[abbreviation] ?? "01"}-01`
}

// Accepting activity as a prop also makes the empty state easy to check.
export function DashboardPage({
  activity = recentActivity,
}: {
  activity?: DemoActivity[]
}) {
  const { session } = useSession()
  const { t, locale } = useI18n()
  const roleLabel = useRoleLabel()
  const money = (amount: number) => formatMoney(amount, locale)

  const welcomeName = session?.firstName ?? demoMember.firstName
  const groupDisplayName = session?.user.group_name ?? demoGroup.name
  const groupCardDetail = session
    ? `${roleLabel(session.user.role)} · ${session.user.email}`
    : t("dashboard.membersAndLocation", {
        count: demoGroup.memberCount,
        location: demoGroup.location,
      })

  const contributionPercent = Math.min(
    100,
    Math.round(
      (demoSummary.monthlyContribution / demoSummary.monthlyTarget) * 100
    )
  )
  const remaining = Math.max(
    0,
    demoSummary.monthlyTarget - demoSummary.monthlyContribution
  )
  const firstMonth = savingsHistory[0]
  const lastMonth = savingsHistory[savingsHistory.length - 1]
  const chartData = savingsHistory.map((entry) => ({
    ...entry,
    month: formatMonth(monthToDate(entry.month), locale, "short"),
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("dashboard.welcome", { name: welcomeName })}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button render={<Link to="/savings" />} nativeButton={false}>
            {t("savings.record")}
          </Button>
          <p className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm">
            <RiCalendarLine
              className="size-5 text-muted-foreground"
              aria-hidden="true"
            />
            {formatMonthYear(demoSummary.periodDate, locale)}
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="border-0 bg-[#006b4f] text-white">
          <CardContent>
            <p className="text-sm text-white/75">
              {t("dashboard.totalSavings")}
            </p>
            <p className="mt-5 text-3xl font-semibold tracking-tight">
              {money(demoSummary.totalSavings)}
            </p>
            <p className="mt-3 text-xs text-white/75">
              {t("dashboard.thisMonth", {
                amount: money(demoSummary.monthlyContribution),
              })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="flex items-center justify-between text-sm text-muted-foreground">
              {t("dashboard.group")}
              <RiGroupLine className="size-5" aria-hidden="true" />
            </p>
            <p className="mt-5 text-2xl font-semibold">{groupDisplayName}</p>
            <p className="mt-3 text-xs text-muted-foreground">{groupCardDetail}</p>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 xl:col-span-1">
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.monthlyContribution")}
            </p>
            <p className="mt-5 font-medium">
              {money(demoSummary.monthlyContribution)} /{" "}
              {money(demoSummary.monthlyTarget)}
            </p>
            <div
              role="progressbar"
              aria-label={t("dashboard.monthlyContribution")}
              aria-valuenow={contributionPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary"
            >
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${contributionPercent}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {t("dashboard.goalProgress", {
                percent: contributionPercent,
                month: formatMonth(demoSummary.periodDate, locale),
              })}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardContent>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-medium">{t("dashboard.savingsHistory")}</h2>
              <span className="text-xs text-muted-foreground">
                {t("dashboard.lastSixMonths")}
              </span>
            </div>
            <ChartContainer
              config={{
                total: { label: t("dashboard.chartSeries"), color: "var(--brand)" },
              }}
              className="aspect-auto h-52 w-full"
              aria-label={t("dashboard.chartSummary", {
                from: money(firstMonth.total),
                fromMonth: formatMonth(monthToDate(firstMonth.month), locale),
                to: money(lastMonth.total),
                toMonth: formatMonth(monthToDate(lastMonth.month), locale),
              })}
            >
              <BarChart
                data={chartData}
                accessibilityLayer
                margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => money(Number(value))}
                    />
                  }
                />
                <Bar
                  dataKey="total"
                  fill="var(--color-total)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={64}
                  isAnimationActive={false}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="border-0 bg-secondary">
          <CardContent className="flex h-full flex-col justify-center">
            <RiWallet3Line className="size-6 text-brand" aria-hidden="true" />
            <p className="mt-5 text-xs font-medium text-brand">
              {t("dashboard.goalEyebrow")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              {t("dashboard.toGo", { amount: money(remaining) })}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {t("dashboard.monthlyTarget", {
                amount: money(demoSummary.monthlyTarget),
              })}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent>
          <h2 className="mb-4 font-medium">{t("dashboard.recentActivity")}</h2>
          {activity.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
              <RiWallet3Line
                className="mx-auto mb-3 size-7 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="font-medium">{t("dashboard.noContributions")}</p>
            </div>
          ) : (
            <Table>
              <TableCaption className="sr-only">
                {t("dashboard.contributionsFor", {
                  name: session?.user.member_name ?? demoMember.name,
                })}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">{t("dashboard.colActivity")}</TableHead>
                  <TableHead scope="col">{t("dashboard.colDate")}</TableHead>
                  <TableHead scope="col">{t("dashboard.colAmount")}</TableHead>
                  <TableHead scope="col">{t("dashboard.colStatus")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activity.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {FIXTURE_DESCRIPTIONS[item.description]
                        ? t(FIXTURE_DESCRIPTIONS[item.description])
                        : item.description}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(item.date, locale)}
                    </TableCell>
                    <TableCell className="font-medium text-brand">
                      + {money(item.amount)}
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                        {FIXTURE_STATUSES[item.status]
                          ? t(FIXTURE_STATUSES[item.status])
                          : item.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
