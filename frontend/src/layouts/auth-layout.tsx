import type { ReactNode } from "react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Logo } from "@/components/logo"
import { useI18n } from "@/i18n/i18n-context"

export function AuthLayout({ children }: { children: ReactNode }) {
  const { t } = useI18n()

  return (
    <div className="min-h-svh bg-background lg:grid lg:grid-cols-[minmax(280px,30%)_minmax(0,1fr)]">
      <aside className="flex flex-col justify-between gap-10 bg-[#006b4f] p-6 text-white sm:p-10 lg:min-h-svh">
        <Logo />
        <div className="my-auto hidden lg:block">
          <h2 className="text-3xl leading-tight font-semibold tracking-tight xl:text-4xl">
            {t("auth.taglineOne")}
            <br />
            {t("auth.taglineTwo")}
          </h2>
          <img
            src="/ikimina-illustration.webp"
            alt={t("auth.illustrationAlt")}
            width={1536}
            height={1024}
            loading="lazy"
            decoding="async"
            className="mt-10 h-auto w-full"
          />
        </div>
      </aside>
      <div className="flex min-w-0 flex-col p-6 sm:p-10 lg:px-12">
        <div className="flex items-center justify-end gap-4 text-sm text-muted-foreground">
          <LanguageSwitcher />
        </div>
        <main
          id="main-content"
          className="mx-auto flex w-full max-w-[480px] flex-1 flex-col justify-center py-12 lg:py-16"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
