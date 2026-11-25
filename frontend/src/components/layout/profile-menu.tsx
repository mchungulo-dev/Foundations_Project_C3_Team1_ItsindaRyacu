import { useState } from "react"
import { RiLogoutBoxRLine, RiUserLine } from "@remixicon/react"
import { Link } from "react-router-dom"
import { resetSampleData } from "@/api/demo-auth"
import { demoMode } from "@/api/mode"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useSession } from "@/context/session-context"
import { useSignOut } from "@/hooks/use-sign-out"
import { useI18n } from "@/i18n/i18n-context"
import { useRoleLabel } from "@/i18n/use-role-label"

export function ProfileMenu() {
  const { session } = useSession()
  const { t } = useI18n()
  const roleLabel = useRoleLabel()
  const signOut = useSignOut()
  const [open, setOpen] = useState(false)

  if (!session) {
    return null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={t("nav.profileMenu")}
            className="flex size-11 items-center justify-center rounded-full bg-secondary text-xs font-medium focus-visible:outline-2 focus-visible:outline-primary"
          />
        }
      >
        {session.initials}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 gap-0 overflow-hidden p-0">
        <PopoverHeader className="flex-row items-center gap-3 border-b border-border bg-secondary px-4 py-3 text-secondary-foreground">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#006b4f] text-sm font-medium text-white"
            aria-hidden="true"
          >
            {session.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{session.user.member_name}</p>
            <p className="text-muted-foreground">
              {roleLabel(session.user.role)}
            </p>
          </div>
        </PopoverHeader>
        <div className="flex flex-col gap-1 p-2">
          <LanguageSwitcher className="sm:hidden" />
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center gap-3 rounded-md px-2 hover:bg-muted"
          >
            <RiUserLine className="size-5" aria-hidden="true" />
            {t("nav.profile")}
          </Link>
          {demoMode ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                resetSampleData()
                signOut()
              }}
            >
              {t("demo.resetMenu")}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="mt-1"
            onClick={signOut}
          >
            <RiLogoutBoxRLine aria-hidden="true" />
            {t("action.logOut")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
