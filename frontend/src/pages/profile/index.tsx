import { RiLogoutBoxRLine } from "@remixicon/react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Initials } from "@/components/list-row"
import { PillGroup } from "@/components/pill-group"
import { SampleNotice } from "@/components/request-states"
import { SectionCard } from "@/components/section-card"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { useSession } from "@/context/session-context"
import { useSignOut } from "@/hooks/use-sign-out"
import { useI18n } from "@/i18n/i18n-context"
import type { MessageKey } from "@/i18n/locales/en"
import { ContactCard } from "@/pages/profile/contact-card"
import { PasswordCard } from "@/pages/profile/password-card"
import { RoleBadge } from "@/pages/members/members-table"

const THEMES: { value: "system" | "light" | "dark"; label: MessageKey }[] = [
  { value: "system", label: "theme.system" },
  { value: "light", label: "theme.light" },
  { value: "dark", label: "theme.dark" },
]

export function ProfilePage() {
  const { session } = useSession()
  const { t } = useI18n()
  const { theme, setTheme } = useTheme()
  const signOut = useSignOut()

  if (!session) {
    return null
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <SampleNotice />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Initials name={session.user.member_name} />
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight">
              {session.user.member_name}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <RoleBadge role={session.user.role} />
              <span>
                {session.user.group_name} · {session.user.email}
              </span>
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={signOut}
        >
          <RiLogoutBoxRLine aria-hidden="true" />
          {t("action.logOut")}
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ContactCard />
        <PasswordCard />
      </div>
      <SectionCard title={t("profile.preferences")}>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t("language.label")}
            </p>
            <LanguageSwitcher className="w-fit" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t("profile.theme")}
            </p>
            <PillGroup
              wrap
              label={t("profile.theme")}
              value={theme}
              onChange={(value) => setTheme(value as typeof theme)}
              items={THEMES.map((option) => ({
                value: option.value,
                label: t(option.label),
              }))}
            />
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
