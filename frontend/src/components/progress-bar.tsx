export function ProgressBar({
  value,
  label,
}: {
  value: number
  label: string
}) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2 overflow-hidden rounded-full bg-border"
    >
      <div
        className="h-full rounded-full bg-brand"
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  )
}
