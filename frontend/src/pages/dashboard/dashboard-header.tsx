import type { ReactNode } from "react"
import { useSession } from "@/context/session-context"
import { useI18n } from "@/i18n/i18n-context"

export function DashboardHeader({ children }: { children?: ReactNode }) {
  const { session } = useSession()
  const { t } = useI18n()

  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <h1 className="min-w-0 text-3xl font-semibold tracking-tight">
        {t("dashboard.welcome", { name: session?.firstName ?? "" })}
      </h1>
      {children ? (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {children}
        </div>
      ) : null}
    </div>
  )
}
