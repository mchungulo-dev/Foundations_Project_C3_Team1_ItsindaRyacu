import {
  RiGroupLine,
  RiLayoutGridLine,
  RiLogoutBoxRLine,
  RiTeamLine,
  RiWallet3Line,
} from "@remixicon/react"
import { NavLink, useNavigate } from "react-router-dom"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { useSession } from "@/context/session-context"
import { demoGroup, demoMember } from "@/data/demo-data"
import { useI18n } from "@/i18n/i18n-context"
import type { MessageKey } from "@/i18n/locales/en"
import { useRoleLabel } from "@/i18n/use-role-label"
import { canManageMembers import { RiLogoutBoxRLine } from "@remixicon/react"
import { NavLink } from "react-router-dom"
import { navFor, type NavItem } from "@/components/layout/nav-items"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { useSession } from "@/context/session-context"
import { useSignOut } from "@/hooks/use-sign-out"
import { useI18n } from "@/i18n/i18n-context"
import type { MessageKey } from "@/i18n/locales/en"
import { useRoleLabel } from "@/i18n/use-role-label"

const SECTIONS: { key: NavItem["section"]; label?: MessageKey }[] = [
  { key: undefined },
  { key: "money", label: "nav.sectionMoney" },
  { key: "group", label: "nav.sectionGroup" },
  { key: "records", label: "nav.sectionRecords" },
]

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { session } = useSession()
  const { t } = useI18n()
  const roleLabel = useRoleLabel()
  const signOut = useSignOut()

  const memberRole = session ? roleLabel(session.user.role) : ""
  const memberName = session?.user.member_name ?? ""
  const memberInitials = session?.initials ?? ""
  const navigation = navFor(session?.user.role)

  return (
    <div className="flex h-full flex-col bg-[#006b4f] p-4 text-white">
      <div onClick={onNavigate} className="px-1">
        <Logo to="/dashboard" />
      </div>
      <nav
        aria-label={t("nav.main")}
        className="mt-10 no-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto"
      >
        {SECTIONS.map(({ key, label }) => {
          const items = navigation.filter((item) => item.section === key)
          if (items.length === 0) {
            return null
          }
          return (
            <div key={key ?? "main"} className="space-y-0.5">
              {label ? (
                <p className="px-3 pb-1 text-xs font-medium tracking-wide text-white/85 uppercase">
                  {t(label)}
                </p>
              ) : null}
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex min-h-11 items-center gap-3 rounded-lg px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-primary lg:min-h-9 ${isActive ? "bg-white/15 font-medium text-white" : "text-white/85 hover:bg-white/10"}`
                  }
                >
                  <item.icon
                    className="size-5 text-[#b2f52b]"
                    aria-hidden="true"
                  />
                  {t(item.label)}
                </NavLink>
              ))}
            </div>
          )
        })}
      </nav>
      <div className="mt-3 flex items-center gap-3 border-t border-white/15 pt-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#b2f52b] text-sm font-medium text-[#173f35]"
          aria-hidden="true"
        >
          {memberInitials}
        </span>
        <div className="min-w-0 flex-1 text-xs">
          <p className="truncate font-medium">{memberName}</p>
          <p className="truncate text-white/85">{memberRole}</p>
        </div>
        {session ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-white/80 hover:bg-white/10 hover:text-white"
            aria-label={t("action.logOut")}
            onClick={() => {
              signOut()
              onNavigate?.()
            }}
          >
            <RiLogoutBoxRLine className="size-5" aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}
} from "@/lib/permissions"

const navigation: {
  to: string
  label: MessageKey
  icon: typeof RiLayoutGridLine
  adminOnly?: boolean
}[] = [
  { to: "/dashboard", label: "nav.overview", icon: RiLayoutGridLine },
  { to: "/savings", label: "nav.savings", icon: RiWallet3Line },
  { to: "/group", label: "nav.groupPage", icon: RiGroupLine },
  { to: "/members", label: "nav.members", icon: RiTeamLine, adminOnly: true },
]

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate()
  const { session, clearSession } = useSession()
  const { t } = useI18n()
  const roleLabel = useRoleLabel()

  const sessionRole = session ? roleLabel(session.user.role) : ""
  const groupTitle = session?.user.group_name ?? demoGroup.name
  const groupSubtitle = session
    ? `${sessionRole} · ${session.user.email}`
    : t("dashboard.membersAndLocation", {
        count: demoGroup.memberCount,
        location: demoGroup.location,
      })

  const memberName = session?.user.member_name ?? demoMember.name
  const memberRole = session ? sessionRole : t("role.member")
  const memberInitials = session?.initials ?? demoMember.initials

  return (
    <div className="flex h-full flex-col bg-[#006b4f] p-6 text-white">
      <div onClick={onNavigate}>
        <Logo to="/dashboard" />
      </div>
      <div className="mt-8 rounded-xl bg-white/10 p-4">
        <p className="text-sm font-medium">{groupTitle}</p>
        <p className="mt-2 text-xs break-words text-white/70">
          {groupSubtitle}
        </p>
      </div>
      <nav aria-label={t("nav.main")} className="mt-8 flex-1 space-y-2">
        {navigation
          .filter(
            (item) => !item.adminOnly || canManageMembers(session?.user.role)
          )
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm focus-visible:outline-2 focus-visible:outline-primary ${isActive ? "bg-white/10 text-white" : "text-white/75 hover:bg-white/5"}`
              }
            >
              <item.icon className="size-5 text-[#b2f52b]" aria-hidden="true" />
              {t(item.label)}
            </NavLink>
          ))}
      </nav>
      <div className="mt-5 flex items-center gap-3 border-t border-white/15 pt-5">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#b2f52b] text-sm font-medium text-[#173f35]"
          aria-hidden="true"
        >
          {memberInitials}
        </span>
        <div className="min-w-0 flex-1 text-xs">
          <p className="truncate font-medium">{memberName}</p>
          <p className="mt-1 text-white/70">{memberRole}</p>
        </div>
        {session ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-white/80 hover:bg-white/10 hover:text-white"
            aria-label={t("action.logOut")}
            onClick={() => {
              clearSession()
              onNavigate?.()
              navigate("/login", { replace: true })
            }}
          >
            <RiLogoutBoxRLine className="size-5" aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}
