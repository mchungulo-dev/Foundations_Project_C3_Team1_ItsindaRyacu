import type { Saving } from "@/api/types"

export function sortByNewest(savings: Saving[]) {
  return [...savings].sort(
    (a, b) =>
      b.save_date.localeCompare(a.save_date) || b.saving_id - a.saving_id
  )
}

export function totalOf(savings: Saving[]) {
  return savings
    .filter((item) => item.status === "verified")
    .reduce((sum, item) => sum + item.amount, 0)
}

export function percentOf(part: number, whole: number) {
  return whole > 0 ? Math.min(100, Math.round((part / whole) * 100)) : 0
}

export function monthTotal(savings: Saving[], month: string) {
  const prefix = month.slice(0, 7)
  return totalOf(savings.filter((item) => item.save_date.startsWith(prefix)))
}

export function totalUpTo(savings: Saving[], month: string) {
  const prefix = month.slice(0, 7)
  return totalOf(savings.filter((item) => item.save_date.slice(0, 7) <= prefix))
}
