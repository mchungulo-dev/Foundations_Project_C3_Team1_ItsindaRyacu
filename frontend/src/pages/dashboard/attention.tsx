import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import {
  RiArrowRightLine,
  RiCalendarCheckLine,
  RiErrorWarningLine,
  RiFileTextLine,
  RiHandCoinLine,
  RiUserAddLine,
} from "@remixicon/react"
import type { Fine, Group, Loan, MeetingRow } from "@/api/types"
import { RowIcon, RowList } from "@/components/list-row"
import { SectionCard } from "@/components/section-card"
import { Button } from "@/components/ui/button"
import { useSession } from "@/context/session-context"
import { useI18n } from "@/i18n/i18n-context"
import { formatDate, formatMoney, getToday } from "@/lib/format"
import { lendingSummary } from "@/lib/loan-math"
import { can } from "@/lib/permissions"

type Task = {
  key: string
  icon: ReactNode
  text: string
  to: string
  label: string
}

type AttentionProps = {
  group: Group
  loans: Loan[]
  meetings: MeetingRow[]
  fines: Fine[]
}

export function Attention({ group, loans, meetings, fines }: AttentionProps) {
  const { session } = useSession()
  const { t, locale } = useI18n()
  const role = session?.user.role
  const today = getToday()
  const tasks: Task[] = []

  if (group.member_count <= 1 && can("addMember", role)) {
    tasks.push({
      key: "members",
      icon: <RiUserAddLine />,
      text: t("dashboard.addMembersPrompt"),
      to: "/members",
      label: t("members.add"),
    })
  }

  const latest = can("manageMeetings", role)
    ? meetings.find((item) => item.meeting_date <= today)
    : undefined
  if (latest) {
    const date = formatDate(latest.meeting_date, locale)
    const to = `/meetings/${latest.meeting_id}`
    const label = t("dashboard.openMeetingFull")
    if (latest.marked === 0) {
      tasks.push({
        key: "attendance",
        icon: <RiCalendarCheckLine />,
        text: t("dashboard.taskAttendance", { date }),
        to,
        label,
      })
    }
    if (!latest.minutes) {
      tasks.push({
        key: "minutes",
        icon: <RiFileTextLine />,
        text: t("dashboard.taskMinutes", { date }),
        to,
        label,
      })
    }
  }

  const summary = lendingSummary(loans, today)
  const decide = can("decideLoan", role) ? summary.requested.length : 0
  const handOver = can("payLoan", role) ? summary.approved.length : 0
  if (decide > 0) {
    tasks.push({
      key: "decide",
      icon: <RiHandCoinLine />,
      text: t("dashboard.tasksDecide", { count: decide }),
      to: "/loans",
      label: t("dashboard.review"),
    })
  }
  if (handOver > 0) {
    tasks.push({
      key: "handOver",
      icon: <RiHandCoinLine />,
      text: t("dashboard.tasksHandOver", { count: handOver }),
      to: "/loans",
      label: t("dashboard.review"),
    })
  }

  const unpaid = fines.filter((fine) => !fine.is_paid)
  if (unpaid.length > 0) {
    tasks.push({
      key: "fines",
      icon: <RiErrorWarningLine />,
      text: t(
        can("viewGroupFigures", role)
          ? "dashboard.finesGroup"
          : "dashboard.finesMine",
        {
          amount: formatMoney(
            unpaid.reduce((sum, fine) => sum + fine.fine_amount, 0),
            locale
          ),
          count: unpaid.length,
        }
      ),
      to: "/fines",
      label: t("dashboard.viewFines"),
    })
  }

  if (tasks.length === 0) {
    return null
  }

  return (
    <SectionCard
      title={t("dashboard.attentionTitle")}
      action={
        <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
          {tasks.length}
        </span>
      }
    >
      <RowList>
        {tasks.map((task) => (
          <li
            key={task.key}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <RowIcon>{task.icon}</RowIcon>
            <p className="min-w-0 flex-1 text-sm font-medium">{task.text}</p>
            <Button
              size="icon"
              variant="outline"
              className="sm:hidden"
              aria-label={task.label}
              render={<Link to={task.to} />}
              nativeButton={false}
            >
              <RiArrowRightLine aria-hidden="true" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="max-sm:hidden"
              render={<Link to={task.to} />}
              nativeButton={false}
            >
              {task.label}
            </Button>
          </li>
        ))}
      </RowList>
    </SectionCard>
  )
}
