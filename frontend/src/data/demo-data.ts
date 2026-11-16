// Phase 1 fixtures only. These values are not fetched from a backend.
export const demoMember = {
  id: "member-aline",
  name: "Aline Nyiraneza",
  firstName: "Aline",
  initials: "AN",
  role: "Group member",
}

// memberCount matches the sample members in initialMembers below.
export const demoGroup = {
  id: "group-twitezimbere",
  name: "Twitezimbere",
  location: "Kigali",
  meetingDay: "Saturday",
  meetingTime: "16:00",
  memberCount: 4,
  monthlyTarget: 20000,
}

// Phase 2 fixtures. The backend has no member or savings endpoints yet, so the
// group page, member pages and savings page use these local records. Each
// account has exactly one group, so members need no group id.
export type MemberStatus = "Active" | "Pending" | "Inactive"

export type Member = {
  id: string
  name: string
  phone: string
  // Backend role code: admin, chairperson, treasurer, member
  role: string
  status: MemberStatus
  joinedAt: string
}

export type Contribution = {
  id: string
  memberId: string
  date: string
  amount: number
}

export const initialMembers: Member[] = [
  {
    id: demoMember.id,
    name: demoMember.name,
    phone: "+250788123456",
    role: "member",
    status: "Active",
    joinedAt: "2026-01-15",
  },
  {
    id: "member-eric",
    name: "Eric Mutabazi",
    phone: "+250783456789",
    role: "treasurer",
    status: "Active",
    joinedAt: "2026-01-15",
  },
  {
    id: "member-clarisse",
    name: "Clarisse Umutesi",
    phone: "+250789654321",
    role: "admin",
    status: "Active",
    joinedAt: "2026-01-20",
  },
  {
    id: "member-patrick",
    name: "Patrick Nkurunziza",
    phone: "+250782345678",
    role: "chairperson",
    status: "Active",
    joinedAt: "2026-02-01",
  },
]

export const initialContributions: Contribution[] = [
  {
    id: "saving-8",
    memberId: "member-aline",
    date: "2026-11-01",
    amount: 15000,
  },
  {
    id: "saving-7",
    memberId: "member-aline",
    date: "2026-10-27",
    amount: 20000,
  },
  {
    id: "saving-6",
    memberId: "member-aline",
    date: "2026-10-05",
    amount: 20000,
  },
  {
    id: "saving-5",
    memberId: "member-aline",
    date: "2026-10-01",
    amount: 5000,
  },
  {
    id: "saving-4",
    memberId: "member-aline",
    date: "2026-09-01",
    amount: 40000,
  },
  {
    id: "saving-3",
    memberId: "member-aline",
    date: "2026-08-01",
    amount: 40000,
  },
  {
    id: "saving-2",
    memberId: "member-aline",
    date: "2026-07-01",
    amount: 20000,
  },
  {
    id: "saving-1",
    memberId: "member-aline",
    date: "2026-06-01",
    amount: 80000,
  },
  ...["06", "07", "08", "09", "10", "11"].map((month) => ({
    id: `saving-eric-${month}`,
    memberId: "member-eric",
    date: `2026-${month}-01`,
    amount: 30000,
  })),
  ...["06", "07", "08", "09", "10", "11"].map((month, index) => ({
    id: `saving-clarisse-${month}`,
    memberId: "member-clarisse",
    date: `2026-${month}-01`,
    amount: index < 3 ? 40000 : 35000,
  })),
  ...["06", "07", "08", "09", "10", "11"].map((month) => ({
    id: `saving-patrick-${month}`,
    memberId: "member-patrick",
    date: `2026-${month}-01`,
    amount: 25000,
  })),
]

export function memberTotal(contributions: Contribution[], memberId: string) {
  return contributions
    .filter((item) => item.memberId === memberId)
    .reduce((sum, item) => sum + item.amount, 0)
}

export function sortByNewest(contributions: Contribution[]) {
  return [...contributions].sort((a, b) => b.date.localeCompare(a.date))
}

export function totalOf(contributions: Contribution[]) {
  return contributions.reduce((sum, item) => sum + item.amount, 0)
}

export function monthTotal(contributions: Contribution[], month: string) {
  return totalOf(
    contributions.filter((item) => item.date.startsWith(month.slice(0, 7)))
  )
}

export function expectedPerMonth(members: Member[]) {
  return (
    members.filter((member) => member.status === "Active").length *
    demoGroup.monthlyTarget
  )
}
