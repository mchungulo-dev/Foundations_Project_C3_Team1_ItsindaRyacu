import { useLocation } from "react-router-dom"
import { LanguageSwitcher } from "@/components/language-switcher"
import { navItems } from "@/components/layout/nav-items"
import { NotificationBell } from "@/components/layout/notification-bell"
import { ProfileMenu } from "@/components/layout/profile-menu"
import { useSession } from "@/context/session-context"
import { useI18n } from "@/i18n/i18n-context"

export function AppHeader() {
  const { t } = useI18n()
  const { session } = useSession()
  const { pathname } = useLocation()
  const current = navItems.find(
    (item) => pathname === item.to || pathname.startsWith(`${item.to}/`)
  )
  const page =
    pathname === "/profile"
      ? t("nav.profile")
      : t(current?.label ?? "nav.overview")

  return (
    <header className="flex min-h-16 items-center justify-between gap-3 border-b border-border px-5 sm:min-h-20 sm:px-8 lg:border-0 lg:px-10">
      <p className="min-w-0 truncate text-sm text-muted-foreground">
        <span className="hidden sm:inline">
          {session?.user.group_name}
          <span className="px-1.5" aria-hidden="true">
            /
          </span>
        </span>
        <span className="font-medium text-foreground sm:font-normal">
          {page}
        </span>
      </p>
      <div className="flex shrink-0 items-center gap-3">
        <LanguageSwitcher className="hidden sm:flex" />
        <NotificationBell />
        <ProfileMenu />
      </div>
    </header>
  )
}
