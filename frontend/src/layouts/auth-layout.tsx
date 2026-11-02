import type { ReactNode } from "react"
import { Logo } from "@/components/logo"

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-background lg:grid lg:grid-cols-[minmax(280px,30%)_minmax(0,1fr)]">
      <aside className="flex flex-col justify-between gap-10 bg-[#006b4f] p-6 text-white sm:p-10 lg:min-h-svh">
        <Logo />
        <div className="my-auto hidden lg:block">
          <h2 className="text-3xl leading-tight font-semibold tracking-tight xl:text-4xl">
            Save together.
            <br />
            Grow together.
          </h2>
          <img
            src="/ikimina-illustration.webp"
            alt="Group members contributing to a shared savings fund"
            width={1536}
            height={1024}
            className="mt-10 h-auto w-full"
          />
        </div>
      </aside>
      <div className="flex min-w-0 flex-col p-6 sm:p-10 lg:px-12">
        <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>Member access</span>
          <div
            role="group"
            aria-label="Language"
            className="flex rounded-lg bg-secondary p-1"
          >
            <button
              type="button"
              aria-pressed="true"
              className="rounded-md bg-background px-3 py-1.5 text-foreground shadow-xs"
            >
              English
            </button>
            <button
              type="button"
              aria-pressed="false"
              disabled
              className="rounded-md px-3 py-1.5 text-muted-foreground"
            >
              Kinyarwanda
            </button>
          </div>
        </div>
        <main
          id="main-content"
          className="mx-auto flex w-full max-w-[480px] flex-1 flex-col justify-center py-12 lg:py-16"
        >
          {children}
        </main>
        <footer className="text-xs text-muted-foreground">
          © 2026 Itsinda Ryacu
        </footer>
      </div>
    </div>
  )
}
