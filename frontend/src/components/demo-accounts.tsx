import { useState } from "react"
import { DEMO_ACCOUNTS, DEMO_PASSWORD, resetSampleData } from "@/api/demo-auth"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/i18n-context"
import { useRoleLabel } from "@/i18n/use-role-label"

export function DemoAccounts({
  onPick,
}: {
  onPick: (email: string, password: string) => void
}) {
  const { t } = useI18n()
  const roleLabel = useRoleLabel()
  const [restored, setRestored] = useState(false)

  return (
    <section
      aria-label={t("demo.title")}
      className="mt-8 space-y-3 rounded-xl border border-dashed border-border p-4"
    >
      <h2 className="text-base font-semibold">{t("demo.title")}</h2>
      <p className="text-sm text-muted-foreground">
        {t("demo.body", { password: DEMO_PASSWORD })}
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {DEMO_ACCOUNTS.map((account) => (
          <li key={account.email}>
            <Button
              type="button"
              variant="outline"
              className="h-auto min-h-11 w-full flex-col items-start gap-0 py-2 text-left max-md:h-auto"
              onClick={() => onPick(account.email, DEMO_PASSWORD)}
            >
              <span>{account.name}</span>
              <span className="text-sm text-muted-foreground">
                {roleLabel(account.role)}
              </span>
            </Button>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          resetSampleData()
          setRestored(true)
        }}
      >
        {t("demo.reset")}
      </Button>
      {restored ? (
        <p role="status" className="text-sm">
          {t("demo.restored")}
        </p>
      ) : null}
    </section>
  )
}
