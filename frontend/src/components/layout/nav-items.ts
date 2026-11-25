import {
  RiCalendarLine,
  RiGroupLine,
  RiHandCoinLine,
  RiLayoutGridLine,
  RiAlarmWarningLine,
  RiBarChartBoxLine,
  RiFileList3Line,
  RiGiftLine,
  RiMailSendLine,
  RiCalendarEventLine,
  RiTeamLine,
  RiWallet3Line,
} from "@remixicon/react"
import type { MessageKey } from "@/i18n/locales/en"
import { can, type Action } from "@/lib/permissions"

export type NavItem = {
  to: string
  label: MessageKey
  icon: typeof RiLayoutGridLine
  section?: "money" | "group" | "records"
  bottom?: boolean
  action?: Action
}

export const navItems: NavItem[] = [
  {
    to: "/dashboard",
    label: "nav.overview",
    icon: RiLayoutGridLine,
    bottom: true,
  },
  {
    to: "/savings",
    label: "nav.savings",
    icon: RiWallet3Line,
    section: "money",
    bottom: true,
  },
  {
    to: "/loans",
    label: "nav.loans",
    icon: RiHandCoinLine,
    section: "money",
    bottom: true,
  },
  {
    to: "/fines",
    label: "nav.fines",
    icon: RiAlarmWarningLine,
    section: "money",
  },
  {
    to: "/share-out",
    label: "nav.shareOut",
    icon: RiGiftLine,
    section: "money",
  },
  {
    to: "/meetings",
    label: "nav.meetings",
    icon: RiCalendarEventLine,
    section: "group",
    bottom: true,
  },
  {
    to: "/members",
    label: "nav.members",
    icon: RiTeamLine,
    section: "group",
    action: "viewMembers",
  },
  {
    to: "/invitations",
    label: "nav.invitations",
    icon: RiMailSendLine,
    section: "group",
    action: "manageInvitations",
  },
  {
    to: "/cycles",
    label: "nav.cycles",
    icon: RiCalendarLine,
    section: "group",
  },
  { to: "/group", label: "nav.groupPage", icon: RiGroupLine, section: "group" },
  {
    to: "/statements",
    label: "nav.statements",
    icon: RiFileList3Line,
    section: "records",
  },
  {
    to: "/reports",
    label: "nav.reports",
    icon: RiBarChartBoxLine,
    section: "records",
    action: "viewGroupFigures",
  },
]

export function navFor(role: string | undefined) {
  return navItems.filter((item) => !item.action || can(item.action, role))
}
