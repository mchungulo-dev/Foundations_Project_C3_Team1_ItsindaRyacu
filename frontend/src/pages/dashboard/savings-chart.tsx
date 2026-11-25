import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import type { Saving } from "@/api/types"
import { SectionCard } from "@/components/section-card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useI18n } from "@/i18n/i18n-context"
import { formatMoney, formatMonth } from "@/lib/format"
import { totalOf } from "@/lib/savings-totals"

const MONTHS_SHOWN = 6

function lastMonths(end: string) {
  const [year, month] = end.split("-").map(Number)
  return Array.from({ length: MONTHS_SHOWN }, (_, index) => {
    const offset = MONTHS_SHOWN - 1 - index
    return new Date(Date.UTC(year, month - 1 - offset, 1))
      .toISOString()
      .slice(0, 10)
  })
}

type SavingsChartProps = {
  savings: Saving[]
  title: string
  note?: string
  month: string
}

export function SavingsChart({
  savings,
  title,
  note,
  month,
}: SavingsChartProps) {
  const { t, locale } = useI18n()
  const money = (amount: number) => formatMoney(amount, locale)
  const compact = new Intl.NumberFormat(locale === "rw" ? "rw-RW" : "en-RW", {
    notation: "compact",
    maximumFractionDigits: 1,
  })
  const months = lastMonths(month)
  const data = months.map((value, index) => ({
    month: formatMonth(value, locale, "short"),
    total: totalOf(
      savings.filter((item) => item.save_date.slice(0, 7) <= value.slice(0, 7))
    ),
    fill: index === months.length - 1 ? "var(--primary)" : "var(--color-total)",
  }))
  const first = data[0]
  const last = data[data.length - 1]

  return (
    <SectionCard
      title={title}
      description={note}
      action={
        <span className="text-sm text-muted-foreground">
          {t("dashboard.lastSixMonths")}
        </span>
      }
    >
      {last.total === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {t("dashboard.chartEmpty")}
        </p>
      ) : (
        <ChartContainer
          config={{
            total: {
              label: t("dashboard.chartSeries"),
              color: "var(--brand)",
            },
          }}
          className="aspect-auto h-full min-h-56 w-full"
          aria-label={t("dashboard.chartSummary", {
            from: money(first.total),
            fromMonth: formatMonth(months[0], locale),
            to: money(last.total),
            toMonth: formatMonth(months[months.length - 1], locale),
          })}
        >
          <BarChart
            data={data}
            accessibilityLayer
            margin={{ top: 22, right: 8, left: 8, bottom: 0 }}
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
              radius={[6, 6, 0, 0]}
              maxBarSize={64}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="total"
                position="top"
                className="fill-muted-foreground text-xs"
                formatter={(value: unknown) =>
                  Number(value) === 0 ? "" : compact.format(Number(value))
                }
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </SectionCard>
  )
}
