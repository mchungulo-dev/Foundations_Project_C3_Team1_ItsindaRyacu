import { RiMenuLine } from "@remixicon/react"
import { useLocation } from "react-router-dom"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Button } from "@/components/ui/button"
import { SheetTrigger } from "@/components/ui/sheet"
import { useSession } from "@/context/session-context"
import { demoMember } from "@/data/demo-data"
import { useI18n } from "@/i18n/i18n-context"

export function AppHeader() {
  const { session } = useSession()
  const { t } = useI18n()
  const { pathname } = useLocation()
  const page = pathname.startsWith("/members")
    ? t("nav.members")
    : pathname === "/group"
      ? t("nav.groupPage")
      : pathname === "/savings"
        ? t("nav.savings")
        : t("nav.overview")
  const initials = session?.initials ?? demoMember.initials
  const name = session?.user.member_name ?? demoMember.name

  return (
    <header className="flex min-h-20 items-center justify-between gap-3 border-b border-border px-5 sm:px-8 lg:border-0 lg:px-10">
      <div className="flex min-w-0 items-center gap-3">
        <SheetTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden"
              aria-label={t("nav.open")}
            />
          }
        >
          <RiMenuLine aria-hidden="true" />
        </SheetTrigger>
        <p className="text-sm text-muted-foreground">
          {t("nav.workspace")}{" "}
          <span className="px-1.5" aria-hidden="true">
            /
          </span>
          <span className="text-foreground">{page}</span>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <LanguageSwitcher />
        <span
          className="hidden size-9 items-center justify-center rounded-full bg-secondary text-xs font-medium sm:flex"
          aria-label={name}
        >
          {initials}
        </span>
      </div>
    </header>
  )
}
