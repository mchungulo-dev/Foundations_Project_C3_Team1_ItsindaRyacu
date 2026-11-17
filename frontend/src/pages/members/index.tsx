import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { RiAddLine, RiSearchLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Member, MemberStatus } from "@/data/demo-data"
import { useI18n } from "@/i18n/i18n-context"
import type { MessageKey } from "@/i18n/locales/en"
import { useRoleLabel } from "@/i18n/use-role-label"
import { formatMoney, getToday } from "@/lib/format"
import { isValidRwandaPhone, normalizePhone } from "@/lib/validation"
import { MEMBER_STATUS_KEYS } from "@/pages/members/member-status"

const STATUSES: MemberStatus[] = ["Active", "Pending", "Inactive"]
const SELECT_CLASS =
  "h-12 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring"

type MembersPageProps = {
  members: Member[]
  onAddMember: (member: Member) => void
}

// The backend has no members endpoint yet. A new member is added to the shared
// local list only: nothing is saved or sent, and it grants no permissions.
export function MembersPage({ members, onAddMember }: MembersPageProps) {
  const { t, locale } = useI18n()
  const roleLabel = useRoleLabel()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<"all" | MemberStatus>("all")
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<MessageKey | "">("")
  const [addedName, setAddedName] = useState("")

  const query = search.trim().toLowerCase()
  const phoneQuery = normalizePhone(query)
  const visibleMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(query) ||
      (phoneQuery.length > 0 &&
        normalizePhone(member.phone).includes(phoneQuery))
    return matchesSearch && (status === "all" || member.status === status)
  })

  function toggleForm() {
    setError("")
    setAddedName("")
    setShowForm(!showForm)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim() || !isValidRwandaPhone(phone)) {
      setError("validation.memberInvalid")
      return
    }
    if (
      members.some(
        (member) => normalizePhone(member.phone) === normalizePhone(phone)
      )
    ) {
      setError("validation.memberDuplicate")
      return
    }
    onAddMember({
      id: crypto.randomUUID(),
      name: name.trim(),
      phone: `+250${normalizePhone(phone)}`,
      role: "member",
      status: "Pending",
      totalSavings: 0,
      joinedAt: getToday(),
    })
    setAddedName(name.trim())
    setName("")
    setPhone("")
    setError("")
    setShowForm(false)
    setSearch("")
    setStatus("all")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("members.title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("members.count", { count: members.length })}
          </p>
        </div>
        <Button
          onClick={toggleForm}
          aria-expanded={showForm}
          aria-controls="add-member-form"
        >
          <RiAddLine aria-hidden="true" />
          {t("members.add")}
        </Button>
      </div>
      {addedName ? (
        <p role="status" className="rounded-lg bg-secondary p-4 text-sm">
          {t("members.added", { name: addedName })}
        </p>
      ) : null}
      {showForm ? (
        <Card>
          <CardContent>
            <h2 className="mb-5 font-medium">{t("members.new")}</h2>
            <form
              id="add-member-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="member-name">{t("members.name")}</Label>
                  <Input
                    id="member-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    maxLength={100}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-phone">{t("members.phone")}</Label>
                  <Input
                    id="member-phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    autoComplete="tel"
                    placeholder="0788 123 456"
                    required
                  />
                </div>
              </div>
              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {t(error)}
                </p>
              ) : null}
              <div className="flex gap-3">
                <Button type="submit">{t("members.add")}</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  {t("action.cancel")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="relative">
          <RiSearchLine
            className="absolute top-3.5 left-3 size-5 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            aria-label={t("members.search")}
            placeholder={t("members.searchPlaceholder")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-10"
          />
        </div>
        <select
          aria-label={t("members.filterStatus")}
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as "all" | MemberStatus)
          }
          className={SELECT_CLASS}
        >
          <option value="all">{t("members.allStatuses")}</option>
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {t(MEMBER_STATUS_KEYS[item])}
            </option>
          ))}
        </select>
      </div>
      <Card>
        <CardContent>
          {visibleMembers.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {members.length === 0
                ? t("members.emptyNone")
                : t("members.emptyFiltered")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">{t("members.colMember")}</TableHead>
                  <TableHead scope="col">{t("members.colRole")}</TableHead>
                  <TableHead scope="col">{t("members.colStatus")}</TableHead>
                  <TableHead scope="col">{t("members.colSavings")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Link
                        to={`/members/${member.id}`}
                        className="font-medium text-brand hover:underline"
                      >
                        {member.name}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {member.phone}
                      </p>
                    </TableCell>
                    <TableCell>{roleLabel(member.role)}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                        {t(MEMBER_STATUS_KEYS[member.status])}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatMoney(member.totalSavings, locale)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
