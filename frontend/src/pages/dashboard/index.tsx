import { useCallback } from "react"
import { getActiveCycle, getCycles } from "@/api/cycles"
import { getFines } from "@/api/fines"
import { getGroup } from "@/api/group"
import { getLoans } from "@/api/loans"
import { getMemberPicker } from "@/api/members"
import { getAttendanceSummary, getMeetings } from "@/api/meetings"
import { getSavings } from "@/api/savings"
import { getShareOut } from "@/api/share-out"
import {
  LoadingSpinner,
  RequestError,
  SampleNotice,
} from "@/components/request-states"
import { useSession } from "@/context/session-context"
import { useRequest } from "@/hooks/use-request"
import { can } from "@/lib/permissions"
import { DashboardHeader } from "@/pages/dashboard/dashboard-header"
import { GettingStarted } from "@/pages/dashboard/getting-started"
import { GroupDashboard } from "@/pages/dashboard/group-dashboard"
import { MemberDashboard } from "@/pages/dashboard/member-dashboard"
import { ShareOutCard } from "@/pages/dashboard/share-out-card"

async function loadDashboard(role: string | undefined) {
  const officer = can("viewGroupFigures", role)
  const [group, cycle, loans, meetings, fines, members, absences] =
    await Promise.all([
      getGroup(),
      getActiveCycle(),
      getLoans(),
      getMeetings(),
      getFines(),
      officer ? getMemberPicker() : Promise.resolve([]),
      can("manageMeetings", role)
        ? getAttendanceSummary()
        : Promise.resolve([]),
    ])
  const overview = cycle ? await getSavings(cycle.cycle_id) : null
  const last = cycle
    ? undefined
    : (await getCycles()).find((item) => item.status === "closed")
  const shareOut = last ? await getShareOut(last.cycle_id) : null
  const missed = absences.filter((row) => row.recent_absent >= 2)
  return {
    group,
    cycle,
    overview,
    members,
    loans,
    meetings,
    fines,
    missed,
    shareOut,
  }
}

export function DashboardPage() {
  const { session } = useSession()
  const role = session?.user.role
  const load = useCallback(() => loadDashboard(role), [role])
  const { data, error, reload } = useRequest(load)

  if (error) {
    return <RequestError error={error} onRetry={reload} />
  }
  if (!data) {
    return <LoadingSpinner />
  }
  const { group, cycle, overview, members, loans, meetings, fines, missed } =
    data

  return (
    <div className="space-y-6">
      <SampleNotice />
      {!overview || !cycle ? (
        <>
          <DashboardHeader />
          <ShareOutCard shareOut={data.shareOut} />
          <GettingStarted />
        </>
      ) : can("viewGroupFigures", role) ? (
        <GroupDashboard
          group={group}
          cycle={cycle}
          overview={overview}
          members={members}
          loans={loans}
          meetings={meetings}
          fines={fines}
          missed={missed}
        />
      ) : (
        <MemberDashboard
          group={group}
          cycle={cycle}
          overview={overview}
          loans={loans}
          meetings={meetings}
          fines={fines}
        />
      )}
    </div>
  )
}
