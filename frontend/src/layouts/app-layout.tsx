import { useState, type ReactNode } from "react"
import { AppBottomNav } from "@/components/layout/app-bottom-nav"
import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { PhonesProvider } from "@/context/phones-context"
import { useI18n } from "@/i18n/i18n-context"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"

export function AppLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { t } = useI18n()

  return (
    <PhonesProvider>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <div className="min-h-svh bg-muted/25 lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="sticky top-0 hidden h-svh lg:block">
            <AppSidebar />
          </aside>
          <SheetContent
            side="left"
            className="w-[280px] max-w-[85vw] gap-0 border-0 bg-[#006b4f] text-white lg:hidden"
          >
            <SheetTitle className="sr-only">{t("nav.group")}</SheetTitle>
            <SheetDescription className="sr-only">
              {t("nav.groupPages")}
            </SheetDescription>
            <AppSidebar onNavigate={() => setMenuOpen(false)} />
          </SheetContent>
          <div className="min-w-0">
            <AppHeader />
            <main
              id="main-content"
              className="mx-auto max-w-7xl px-5 pt-6 pb-24 sm:px-8 lg:px-10 lg:pb-6"
            >
              {children}
            </main>
          </div>
        </div>
        <AppBottomNav />
      </Sheet>
    </PhonesProvider>
  )
}
