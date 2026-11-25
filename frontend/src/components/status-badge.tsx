import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

const TONES = {
  good: "bg-secondary text-secondary-foreground",
  warn: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200",
  bad: "bg-destructive/10 text-destructive",
}

export function StatusBadge({
  tone,
  children,
}: {
  tone: keyof typeof TONES
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        TONES[tone]
      )}
    >
      {children}
    </span>
  )
}
