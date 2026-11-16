import { RiLayoutGridLine, RiLogoutBoxRLine } from "@remixicon/react"
import { NavLink, useNavigate } from "react-router-dom"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { useSession } from "@/context/session-context"
import { demoGroup, demoMember } from "@/data/demo-data"

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate()
  const { session, clearSession } = useSession()

  const groupTitle = session?.user.group_name ?? demoGroup.name
  const groupSubtitle = session
    ? `${session.roleLabel} · ${session.user.email}`
    : `${demoGroup.memberCount} members · ${demoGroup.location}`

  const memberName = session?.user.member_name ?? demoMember.name
  const memberRole = session?.roleLabel ?? demoMember.role
  const memberInitials = session?.initials ?? demoMember.initials

  return (
    <div className="flex h-full flex-col bg-[#006b4f] p-6 text-white">
      <div onClick={onNavigate}>
        <Logo to="/dashboard" />
      </div>
      <div className="mt-8 rounded-xl bg-white/10 p-4">
        <p className="text-sm font-medium">{groupTitle}</p>
        <p className="mt-2 break-words text-xs text-white/70">{groupSubtitle}</p>
      </div>
      <nav aria-label="Main navigation" className="mt-8 flex-1">
        <NavLink
          to="/dashboard"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-3 text-sm focus-visible:outline-2 focus-visible:outline-primary ${isActive ? "bg-white/10 text-white" : "text-white/75 hover:bg-white/5"}`
          }
        >
          <RiLayoutGridLine
            className="size-5 text-[#b2f52b]"
            aria-hidden="true"
          />
          Overview
        </NavLink>
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
            aria-label="Log out"
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
