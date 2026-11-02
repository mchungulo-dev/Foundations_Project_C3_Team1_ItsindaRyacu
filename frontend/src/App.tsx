import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom"
import { AppLayout } from "@/layouts/app-layout"
import { LoginPage } from "@/pages/auth/login"
import { RegisterPage } from "@/pages/auth/register"
import { DashboardPage } from "@/pages/dashboard"
import { DesignSystemPage } from "@/pages/design-system"

export function App() {
  return (
    <BrowserRouter>
      <a
        href="#main-content"
        className="sr-only z-[100] rounded bg-primary px-4 py-3 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          }
        />
        <Route
          path="/design-system"
          element={
            <div id="main-content">
              <DesignSystemPage />
            </div>
          }
        />
        <Route
          path="*"
          element={
            <main
              id="main-content"
              className="mx-auto flex min-h-svh max-w-lg flex-col justify-center gap-5 px-6"
            >
              <p className="text-sm text-muted-foreground">
                404 · PAGE NOT FOUND
              </p>
              <h1 className="text-4xl font-semibold tracking-tight">
                This page isn’t here.
              </h1>
              <p className="text-muted-foreground">
                Check the address or return to the sign-in page.
              </p>
              <Link
                to="/login"
                className="w-fit font-medium text-brand underline underline-offset-4"
              >
                Back to sign in
              </Link>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
