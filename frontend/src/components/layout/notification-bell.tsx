import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { RiNotification3Line } from "@remixicon/react"
import { getActiveCycle } from "@/api/cycles"
import { getFines } from "@/api/fines"
import { getLoans } from "@/api/loans"
import { getMeetings } from "@/api/meetings"
import { getSavings } from "@/api/savings"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useSession } from "@/context/session-context"
import { useRequest } from "@/hooks/use-request"
import { useI18n } from "@/i18n/i18n-context"
import { formatMonth, getToday } from "@/lib/format"
import { buildNotifications, type Notice } from "@/lib/notifications"

async function loadNotificationData() {
  const cycle = await getActiveCycle()
  const [overview, loans, fines, meetings] = await Promise.all([
    cycle ? getSavings(cycle.cycle_id) : null,
    getLoans(),
    getFines(),
    getMeetings(),
  ])
  return {
    cycleActive: Boolean(cycle),
    savings: overview?.contributions ?? [],
    loans,
    fines,
    meetings,
  }
}

const SEEN_KEY = "ir_seen_notices"

const noticeKey = (notice: Notice) => `${notice.id}|${notice.text}`

function readSeen(memberId: number | undefined) {
  try {
    const raw = localStorage.getItem(`${SEEN_KEY}_${memberId}`)
    return new Set<string>(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set<string>()
  }
}

function writeSeen(memberId: number | undefined, keys: string[]) {
  try {
    localStorage.setItem(`${SEEN_KEY}_${memberId}`, JSON.stringify(keys))
  } catch {
    return
  }
}

export function NotificationBell() {
  const { session } = useSession()
  const { t, locale } = useI18n()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const first = useRef(true)
  const { data, error, reload } = useRequest(loadNotificationData)

  useEffect(() => {
    if (!first.current) {
      reload()
    }
    first.current = false
  }, [pathname, reload])

  useEffect(() => {
    if (open) {
      reload()
    }
  }, [open, reload])

  const memberId = session?.user.member_id
  const notices =
    session && data
      ? buildNotifications(
          {
            role: session.user.role,
            memberId,
            today: getToday(),
            ...data,
          },
          t,
          locale
        )
      : []
  const [seen, setSeen] = useState(() => readSeen(memberId))

  function changeOpen(next: boolean) {
    if (!next && notices.length > 0) {
      const current = notices.map(noticeKey)
      writeSeen(memberId, current)
      setSeen(new Set(current))
    }
    setOpen(next)
  }

  if (!session) {
    return null
  }
  const unseen = open
    ? 0
    : notices.filter((notice) => !seen.has(noticeKey(notice))).length
  const month = formatMonth(`${getToday().slice(0, 7)}-01`, locale)

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={t("notifications.open", { count: unseen })}
            className="relative flex size-11 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
          />
        }
      >
        <RiNotification3Line className="size-5" aria-hidden="true" />
        {unseen > 0 ? (
          <span className="absolute top-1 right-1 flex min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-medium text-white">
            {unseen}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 max-w-[calc(100vw-2rem)] gap-0 overflow-hidden p-0"
      >
        <PopoverHeader className="border-b border-border bg-secondary px-4 py-3 text-secondary-foreground">
          <p className="font-medium">{t("notifications.title")}</p>
          <p className="text-muted-foreground">{month}</p>
        </PopoverHeader>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {error ? (
            <p className="px-2 py-2 text-sm text-destructive">
              {t("notifications.error")}
            </p>
          ) : !data ? (
            <p className="px-2 py-2 text-sm text-muted-foreground">
              {t("notifications.loading")}
            </p>
          ) : notices.length === 0 ? (
            <p className="px-2 py-2 text-sm text-muted-foreground">
              {t("notifications.empty")}
            </p>
          ) : (
            <ul className="space-y-0.5">
              {notices.map((notice) => (
                <li key={notice.id}>
                  <Link
                    to={notice.to}
                    onClick={() => changeOpen(false)}
                    className="flex min-h-11 items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted"
                  >
                    <span
                      className="size-2 shrink-0 rounded-full bg-[#006b4f]"
                      aria-hidden="true"
                    />
                    {notice.text}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
