import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

const circle =
  "flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground"

export function Initials({ name }: { name: string }) {
  const letters = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("")

  return (
    <span aria-hidden="true" className={cn(circle, "text-sm font-semibold")}>
      {letters}
    </span>
  )
}

export function RowIcon({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className={cn(circle, "text-brand [&_svg]:size-5")}
    >
      {children}
    </span>
  )
}

export function RowList({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <ul className={cn("divide-y divide-border", className)}>{children}</ul>
}

type ListRowProps = {
  leading?: ReactNode
  title: string
  to?: string
  subtitle?: ReactNode
  value?: string
  note?: ReactNode
  children?: ReactNode
}

export function ListRow({
  leading,
  title,
  to,
  subtitle,
  value,
  note,
  children,
}: ListRowProps) {
  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3">
        {leading}
        <div className="min-w-0 flex-1">
          {to ? (
            <Link
              to={to}
              className="block truncate font-medium hover:underline hover:underline-offset-4"
            >
              {title}
            </Link>
          ) : (
            <p className="truncate font-medium">{title}</p>
          )}
          {subtitle ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {value || note ? (
          <div className="flex shrink-0 flex-col items-end gap-1">
            {value ? (
              <p className="font-semibold text-brand tabular-nums">{value}</p>
            ) : null}
            {note}
          </div>
        ) : null}
      </div>
      <div className="mt-2 pl-[3.25rem] empty:hidden">{children}</div>
    </li>
  )
}
