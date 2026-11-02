import { RiSeedlingLine } from "@remixicon/react"
import { Link } from "react-router-dom"

export function Logo({ to = "/login" }: { to?: string }) {
  return (
    <Link
      to={to}
      className="inline-flex w-fit items-center gap-3 rounded-lg font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <RiSeedlingLine className="size-6" aria-hidden="true" />
      </span>
      <span>Itsinda Ryacu</span>
    </Link>
  )
}
