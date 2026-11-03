import { RiCalendarLine, RiGroupLine, RiWallet3Line } from "@remixicon/react"
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
import {
  demoGroup,
  demoMember,
  demoSummary,
  recentActivity,
  savingsHistory,
  type DemoActivity,
} from "@/data/demo-data"
import { formatDate, formatMoney } from "@/lib/format"

export function DashboardPage({
  activity = recentActivity,
}: {
  activity?: DemoActivity[]
}) {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back, {demoMember.firstName}.
        </h1>
        <p className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm">
          <RiCalendarLine
            className="size-5 text-muted-foreground"
            aria-hidden="true"
          />
          {demoSummary.period}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="border-0 bg-[#006b4f] text-white">
          <CardContent>
            <p className="text-sm text-white/75">Your total savings</p>
            <p className="mt-5 text-3xl font-semibold tracking-tight">
              {formatMoney(demoSummary.totalSavings)}
            </p>
            <p className="mt-3 text-xs text-white/75">
              + {formatMoney(demoSummary.monthlyContribution)} this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="flex items-center justify-between text-sm text-muted-foreground">
              Your group
              <RiGroupLine className="size-5" aria-hidden="true" />
            </p>
            <p className="mt-5 text-2xl font-semibold">{demoGroup.name}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              {demoGroup.memberCount} members · {demoGroup.location}
            </p>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 xl:col-span-1">
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Monthly contribution
            </p>
            <p className="mt-5 font-medium">
              {formatMoney(demoSummary.monthlyContribution)} /{" "}
              {formatMoney(demoSummary.monthlyTarget)}
            </p>
            <div
              role="progressbar"
              aria-label="Monthly contribution"
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
              {contributionPercent}% of your November goal
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardContent>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-medium">Savings history</h2>
              <span className="text-xs text-muted-foreground">
                Last 6 months · RWF
              </span>
            </div>
            <ChartContainer
              config={{
                total: { label: "Total savings", color: "var(--brand)" },
              }}
              className="aspect-auto h-52 w-full"
              aria-label="Savings increased from RWF 80,000 in June to RWF 240,000 in November"
            >
              <BarChart
                data={savingsHistory}
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
                      formatter={(value) => formatMoney(Number(value))}
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
              THIS MONTH’S GOAL
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              {formatMoney(remaining)} to go.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Monthly target: {formatMoney(demoSummary.monthlyTarget)}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent>
          <h2 className="mb-4 font-medium">Recent activity</h2>
          {activity.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
              <RiWallet3Line
                className="mx-auto mb-3 size-7 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="font-medium">No contributions yet</p>
            </div>
          ) : (
            <Table>
              <TableCaption className="sr-only">
                Contributions for {demoMember.name}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Activity</TableHead>
                  <TableHead scope="col">Date</TableHead>
                  <TableHead scope="col">Amount</TableHead>
                  <TableHead scope="col">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activity.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(item.date)}
                    </TableCell>
                    <TableCell className="font-medium text-brand">
                      + {formatMoney(item.amount)}
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                        {item.status}
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
