import { useState } from "react"
import { getFines, issueFine } from "@/api/fines"
import { getGroup } from "@/api/group"
import type { AttendanceStatus, Meeting } from "@/api/types"
import { useRequest } from "@/hooks/use-request"
import { useI18n } from "@/i18n/i18n-context"
import { formatDate } from "@/lib/format"

const load = () => Promise.all([getFines(), getGroup()])

export function useMeetingFines(meeting: Meeting) {
  const { t, locale } = useI18n()
  const { data, error, reload } = useRequest(load)
  const [busy, setBusy] = useState<number | "all" | null>(null)
  const [failure, setFailure] = useState<unknown>(null)
  const date = formatDate(meeting.meeting_date, locale)

  function fineFor(status: AttendanceStatus | undefined) {
    if (!data || (status !== "late" && status !== "absent")) {
      return null
    }
    const amount =
      status === "late" ? data[1].late_fine_amount : data[1].absent_fine_amount
    if (amount <= 0) {
      return null
    }
    return {
      amount,
      reason: t(status === "late" ? "fines.reasonLate" : "fines.reasonAbsent", {
        date,
      }),
    }
  }

  function isIssued(memberId: number, status: AttendanceStatus | undefined) {
    const fine = fineFor(status)
    return Boolean(
      fine &&
      data?.[0].some(
        (item) =>
          item.meeting_id === meeting.meeting_id &&
          item.member_id === memberId &&
          item.reason === fine.reason
      )
    )
  }

  async function issue(
    list: { memberId: number; status: AttendanceStatus | undefined }[]
  ) {
    setBusy(list.length === 1 ? list[0].memberId : "all")
    setFailure(null)
    try {
      for (const { memberId, status } of list) {
        const fine = fineFor(status)
        if (fine && !isIssued(memberId, status)) {
          await issueFine({
            member_id: memberId,
            fine_amount: fine.amount,
            reason: fine.reason,
            meeting_id: meeting.meeting_id,
          })
        }
      }
    } catch (caught) {
      setFailure(caught)
    }
    reload()
    setBusy(null)
  }

  return {
    loaded: Boolean(data),
    error,
    reload,
    fineFor,
    isIssued,
    issue,
    busy,
    failure,
  }
}
