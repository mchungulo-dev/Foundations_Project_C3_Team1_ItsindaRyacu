import { useState, type FormEvent } from "react"
import { RiAddLine } from "@remixicon/react"
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
import { useSession } from "@/context/session-context"
import { demoGroup, initialContributions } from "@/data/demo-data"
import { useI18n } from "@/i18n/i18n-context"
import type { MessageKey } from "@/i18n/locales/en"
import { formatDate, formatMoney, getToday } from "@/lib/format"
import { isValidAmount, isValidDate } from "@/lib/validation"

// The backend has no savings endpoint yet. Contributions live in this page's
// state, so they reset when you leave the page or reload.
export function SavingsPage() {
  const { session } = useSession()
  const { t, locale } = useI18n()
  const [contributions, setContributions] = useState(initialContributions)
  const [showForm, setShowForm] = useState(false)
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(getToday)
  const [error, setError] = useState<MessageKey | "">("")
  const [added, setAdded] = useState(false)
  const today = getToday()
  const money = (value: number) => formatMoney(value, locale)
  const total = contributions.reduce((sum, item) => sum + item.amount, 0)
  const monthlyTotal = contributions
    .filter((item) => item.date.startsWith(today.slice(0, 7)))
    .reduce((sum, item) => sum + item.amount, 0)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isValidAmount(amount)) {
      setError("validation.amountInvalid")
      return
    }
    if (!isValidDate(date) || date > today) {
      setError("validation.dateInvalid")
      return
    }
    if (!Number.isSafeInteger(total + Number(amount))) {
      setError("validation.amountTooLarge")
      return
    }
    setContributions((previous) =>
      [
        { id: crypto.randomUUID(), amount: Number(amount), date },
        ...previous,
      ].sort((a, b) => b.date.localeCompare(a.date))
    )
    setAmount("")
    setDate(today)
    setError("")
    setAdded(true)
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("savings.title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {session?.user.group_name ?? demoGroup.name}
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm)
            setError("")
            setAdded(false)
          }}
          aria-expanded={showForm}
          aria-controls="contribution-form"
        >
          <RiAddLine aria-hidden="true" />
          {t("savings.record")}
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 bg-[#006b4f] text-white">
          <CardContent>
            <p className="text-sm text-white/75">{t("savings.total")}</p>
            <p className="mt-4 text-3xl font-semibold">{money(total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("savings.thisMonth")}
            </p>
            <p className="mt-4 text-2xl font-semibold">{money(monthlyTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("savings.monthlyTarget")}
            </p>
            <p className="mt-4 text-2xl font-semibold">
              {money(demoGroup.monthlyTarget)}
            </p>
          </CardContent>
        </Card>
      </div>
      {added ? (
        <p role="status" className="rounded-lg bg-secondary p-4 text-sm">
          {t("savings.added")}
        </p>
      ) : null}
      {showForm ? (
        <Card>
          <CardContent>
            <h2 className="mb-5 font-medium">{t("savings.record")}</h2>
            <form
              id="contribution-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contribution-amount">
                    {t("savings.amount")}
                  </Label>
                  <Input
                    id="contribution-amount"
                    type="number"
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="5000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contribution-date">{t("savings.date")}</Label>
                  <Input
                    id="contribution-date"
                    type="date"
                    max={today}
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
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
                <Button type="submit">{t("savings.save")}</Button>
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
      <Card>
        <CardContent>
          <h2 className="mb-5 font-medium">{t("savings.history")}</h2>
          {contributions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("savings.empty")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">{t("savings.colDate")}</TableHead>
                  <TableHead scope="col">{t("savings.colAmount")}</TableHead>
                  <TableHead scope="col">{t("savings.colStatus")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributions.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDate(item.date, locale)}</TableCell>
                    <TableCell className="font-medium text-brand">
                      {money(item.amount)}
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                        {t("savings.recorded")}
                      </span>
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
