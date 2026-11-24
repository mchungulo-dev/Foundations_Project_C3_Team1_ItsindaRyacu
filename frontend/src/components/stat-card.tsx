import type { ReactNode } from "react"
import { RiArrowRightLine } from "@remixicon/react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type StatCardProps = {
  label: string
  value: string
  unit?: string
  note?: string
  action?: { label: string; to?: string; onClick?: () => void }
  highlight?: boolean
  className?: string
  children?: ReactNode
}

function ActionLink({
  action,
  highlight,
}: {
  action: NonNullable<StatCardProps["action"]>
  highlight?: boolean
}) {
  const className = cn(
    "mt-auto inline-flex min-h-9 items-center gap-1 pt-1 text-xs font-medium max-md:min-h-11 sm:text-sm",
    highlight
      ? "text-brand-foreground underline underline-offset-4"
      : "text-brand hover:underline hover:underline-offset-4"
  )
  const content = (
    <>
      {action.label}
      <RiArrowRightLine className="size-4" aria-hidden="true" />
    </>
  )

  return action.to ? (
    <Link to={action.to} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={action.onClick} className={className}>
      {content}
    </button>
  )
}

export function StatCard({
  label,
  value,
  unit,
  note,
  action,
  highlight,
  className,
  children,
}: StatCardProps) {
  const quiet = highlight ? "text-brand-foreground/85" : "text-muted-foreground"

  return (
    <Card
      className={cn(
        "h-full max-sm:[--card-spacing:--spacing(4)]",
        highlight && "border-0 bg-brand text-brand-foreground",
        className
      )}
    >
      <CardContent className="flex h-full flex-col gap-2 sm:gap-3">
        <p className={cn("text-xs sm:text-sm", quiet)}>{label}</p>
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span
            className={cn(
              "font-semibold tracking-tight tabular-nums",
              highlight ? "text-2xl sm:text-3xl" : "text-lg sm:text-2xl"
            )}
          >
            {value}
          </span>
          {unit ? (
            <span className={cn("text-xs font-normal sm:text-sm", quiet)}>
              {unit}
            </span>
          ) : null}
        </p>
        {children}
        {note ? (
          <p className={cn("text-xs sm:text-sm", quiet)}>{note}</p>
        ) : null}
        {action ? <ActionLink action={action} highlight={highlight} /> : null}
      </CardContent>
    </Card>
  )
}
