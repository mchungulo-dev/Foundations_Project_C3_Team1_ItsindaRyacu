// Phase 1 fixtures only. These values are not fetched from a backend.
export const demoMember = {
  name: "Aline Nyiraneza",
  firstName: "Aline",
  initials: "AN",
  role: "Group member",
}

export const demoGroup = {
  name: "Twitezimbere",
  location: "Kigali",
  memberCount: 24,
  totalSavings: 5760000,
}

export const savingsHistory = [
  { month: "Jun", total: 80000 },
  { month: "Jul", total: 100000 },
  { month: "Aug", total: 140000 },
  { month: "Sep", total: 180000 },
  { month: "Oct", total: 225000 },
  { month: "Nov", total: 240000 },
]

export const demoSummary = {
  period: "November 2026",
  totalSavings: savingsHistory[savingsHistory.length - 1].total,
  monthlyContribution: 15000,
  monthlyTarget: 20000,
}

export type DemoActivity = {
  id: string
  description: string
  date: string
  amount: number
  status: string
}

export const recentActivity: DemoActivity[] = [
  {
    id: "contribution-3",
    description: "Monthly savings contribution",
    date: "2026-11-01",
    amount: 15000,
    status: "Recorded",
  },
  {
    id: "contribution-2",
    description: "Monthly savings contribution",
    date: "2026-10-27",
    amount: 20000,
    status: "Recorded",
  },
  {
    id: "contribution-1",
    description: "Monthly savings contribution",
    date: "2026-10-05",
    amount: 20000,
    status: "Recorded",
  },
]
