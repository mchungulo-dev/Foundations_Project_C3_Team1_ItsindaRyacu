import type { ReactNode } from "react"
import { RiArrowRightLine } from "@remixicon/react"
import { Link } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type SectionCardProps = {
  title: string
  description?: string
  action?: ReactNode
  flush?: boolean
  className?: string
  children: ReactNode
}

export function SectionCard({
  title,
  description,
  action,
  flush,
  className,
  children,
}: SectionCardProps) {
  return (
    <Card className={cn("gap-5", flush && "pb-0", className)}>
      <div className="flex items-start justify-between gap-3 px-(--card-spacing)">
        <div className="min-w-0">
          <h2 className="text-base leading-snug font-semibold">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={cn("flex-1", !flush && "px-(--card-spacing)")}>
        {children}
      </div>
    </Card>
  )
}

export function SectionLink({
  to,
  children,
}: {
  to: string
  children: string
}) {
  return (
    <Link
      to={to}
      className="inline-flex min-h-9 items-center gap-1 text-sm font-medium text-brand hover:underline hover:underline-offset-4 max-md:min-h-11"
    >
      {children}
      <RiArrowRightLine className="size-4" aria-hidden="true" />
    </Link>
  )
}
