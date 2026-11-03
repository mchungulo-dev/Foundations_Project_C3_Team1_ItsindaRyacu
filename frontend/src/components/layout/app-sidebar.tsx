import { RiLayoutGridLine } from "@remixicon/react"
import { NavLink } from "react-router-dom"
import { Logo } from "@/components/logo"
import { demoGroup, demoMember } from "@/data/demo-data"

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-[#006b4f] p-6 text-white">
      <div onClick={onNavigate}>
        <Logo to="/dashboard" />
      </div>
      <div className="mt-8 rounded-xl bg-white/10 p-4">
        <p className="text-sm font-medium">{demoGroup.name}</p>
        <p className="mt-2 text-xs text-white/70">
          {demoGroup.memberCount} members · {demoGroup.location}
        </p>
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
          {demoMember.initials}
        </span>
        <div className="min-w-0 text-xs">
          <p className="truncate font-medium">{demoMember.name}</p>
          <p className="mt-1 text-white/70">{demoMember.role}</p>
        </div>
      </div>
    </div>
  )
}
