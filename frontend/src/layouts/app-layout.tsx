import { useState, type ReactNode } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"

export function AppLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <div className="min-h-svh bg-muted/25 lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-svh lg:block">
          <AppSidebar />
        </aside>
        <SheetContent
          side="left"
          className="w-[280px] max-w-[85vw] gap-0 border-0 bg-[#006b4f] text-white lg:hidden"
        >
          <SheetTitle className="sr-only">Group navigation</SheetTitle>
          <SheetDescription className="sr-only">Group pages</SheetDescription>
          <AppSidebar onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
        <div className="min-w-0">
          <AppHeader />
          <main
            id="main-content"
            className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10"
          >
            {children}
          </main>
        </div>
      </div>
    </Sheet>
  )
}
