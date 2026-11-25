import { RiMenuLine } from "@remixicon/react"
import { NavLink } from "react-router-dom"
import { navFor } from "@/components/layout/nav-items"
import { SheetTrigger } from "@/components/ui/sheet"
import { useSession } from "@/context/session-context"
import { useI18n } from "@/i18n/i18n-context"
import { cn } from "@/lib/utils"

const ITEM =
  "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs focus-visible:outline-2 focus-visible:outline-primary"

export function AppBottomNav() {
  const { session } = useSession()
  const { t } = useI18n()
  const items = navFor(session?.user.role).filter((item) => item.bottom)

  return (
    <nav
      aria-label={t("nav.bottom")}
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              ITEM,
              isActive ? "font-medium text-brand" : "text-muted-foreground"
            )
          }
        >
          <item.icon className="size-5" aria-hidden="true" />
          {t(item.label)}
        </NavLink>
      ))}
      <SheetTrigger
        render={
          <button type="button" className={cn(ITEM, "text-muted-foreground")} />
        }
      >
        <RiMenuLine className="size-5" aria-hidden="true" />
        {t("nav.menu")}
      </SheetTrigger>
    </nav>
  )
}
