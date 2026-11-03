import { RiMenuLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { SheetTrigger } from "@/components/ui/sheet"
import { demoMember } from "@/data/demo-data"

export function AppHeader() {
  return (
    <header className="flex min-h-20 items-center justify-between gap-3 border-b border-border px-5 sm:px-8 lg:border-0 lg:px-10">
      <div className="flex min-w-0 items-center gap-3">
        <SheetTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation"
            />
          }
        >
          <RiMenuLine aria-hidden="true" />
        </SheetTrigger>
        <p className="text-sm text-muted-foreground">
          Workspace{" "}
          <span className="px-1.5" aria-hidden="true">
            /
          </span>
          <span className="text-foreground">Overview</span>
        </p>
      </div>
        <span
          className="hidden size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium sm:flex"
          aria-label={demoMember.name}
        >
          {demoMember.initials}
        </span>
    </header>
  )
}
