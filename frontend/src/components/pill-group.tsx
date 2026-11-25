import { cn } from "@/lib/utils"

type PillGroupProps = {
  label: string
  value: string
  items: { value: string; label: string }[]
  onChange: (value: string) => void
  wrap?: boolean
  className?: string
}

export function PillGroup({
  label,
  value,
  items,
  onChange,
  wrap,
  className,
}: PillGroupProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex gap-2",
        wrap ? "flex-wrap" : "overflow-x-auto max-md:-mx-4 max-md:px-4",
        className
      )}
    >
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          aria-pressed={value === item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            "min-h-10 shrink-0 rounded-full border px-4 text-sm font-medium whitespace-nowrap max-md:min-h-11",
            value === item.value
              ? "border-brand bg-brand text-brand-foreground"
              : "border-border bg-card text-foreground hover:bg-muted"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
