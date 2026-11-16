import { useState } from "react"
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom"
import { ProtectedRoute } from "@/components/protected-route"
import { AppLayout } from "@/layouts/app-layout"
import { LoginPage } from "@/pages/auth/login"
import { RegisterPage } from "@/pages/auth/register"
import { CreateGroupPage } from "@/pages/auth/create-group"
import { JoinPage } from "@/pages/auth/join"
import { DashboardPage } from "@/pages/dashboard"
import { DesignSystemPage } from "@/pages/design-system"
import { GroupPage } from "@/pages/group"
import { MembersPage } from "@/pages/members"
import { MemberDetailsPage } from "@/pages/members/details"
import { SavingsPage } from "@/pages/savings"
import { initialContributions, initialMembers } from "@/data/demo-data"
import { useI18n } from "@/i18n/i18n-context"

function NotFoundPage() {
  const { t } = useI18n()

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-svh max-w-lg flex-col justify-center gap-5 px-6"
    >
      <p className="text-sm text-muted-foreground">{t("notFound.eyebrow")}</p>
      <h1 className="text-4xl font-semibold tracking-tight">
        {t("notFound.title")}
      </h1>
      <p className="text-muted-foreground">{t("notFound.body")}</p>
      <Link
        to="/login"
        className="w-fit font-medium text-brand underline underline-offset-4"
      >
        {t("notFound.back")}
      </Link>
    </main>
  )
}

export function App() {
  const { t } = useI18n()
  // One list shared by the member pages, so a new member shows in both the list
  // and the group page. It resets on reload until the backend has endpoints.
  const [members, setMembers] = useState(initialMembers)
  const [contributions, setContributions] = useState(initialContributions)

  return (
    <BrowserRouter>
      <a
        href="#main-content"
        className="sr-only z-[100] rounded bg-primary px-4 py-3 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t("app.skipToContent")}
      </a>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/create-group" element={<CreateGroupPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout>
                <Outlet />
              </AppLayout>
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={
              <DashboardPage members={members} contributions={contributions} />
            }
          />
          <Route
            path="/savings"
            element={
              <SavingsPage
                members={members}
                contributions={contributions}
                onAddContribution={(contribution) =>
                  setContributions((previous) => [...previous, contribution])
                }
              />
            }
          />
          <Route
            path="/group"
            element={
              <GroupPage members={members} contributions={contributions} />
            }
          />
          <Route
            path="/members"
            element={
              <MembersPage
                members={members}
                contributions={contributions}
                onAddMember={(member) =>
                  setMembers((previous) => [...previous, member])
                }
              />
            }
          />
          <Route
            path="/members/:memberId"
            element={
              <MemberDetailsPage
                members={members}
                contributions={contributions}
              />
            }
          />
        </Route>
        <Route
          path="/design-system"
          element={
            <div id="main-content">
              <DesignSystemPage />
            </div>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
