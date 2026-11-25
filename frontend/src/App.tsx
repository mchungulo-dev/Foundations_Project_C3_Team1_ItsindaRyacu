import { lazy, Suspense } from "react"
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom"
import { ProtectedRoute } from "@/components/protected-route"
import { RequireAction } from "@/components/require-action"
import { LoadingSpinner, NotFound } from "@/components/request-states"
import { AppLayout } from "@/layouts/app-layout"
import { LoginPage } from "@/pages/auth/login"
import { useI18n } from "@/i18n/i18n-context"

const RegisterPage = lazy(() =>
  import("@/pages/auth/register").then((m) => ({ default: m.RegisterPage }))
)
const CreateGroupPage = lazy(() =>
  import("@/pages/auth/create-group").then((m) => ({
    default: m.CreateGroupPage,
  }))
)
const CyclesPage = lazy(() =>
  import("@/pages/cycles").then((m) => ({ default: m.CyclesPage }))
)
const DashboardPage = lazy(() =>
  import("@/pages/dashboard").then((m) => ({ default: m.DashboardPage }))
)
const DesignSystemPage = lazy(() =>
  import("@/pages/design-system").then((m) => ({
    default: m.DesignSystemPage,
  }))
)
const FinesPage = lazy(() =>
  import("@/pages/fines").then((m) => ({ default: m.FinesPage }))
)
const GroupPage = lazy(() =>
  import("@/pages/group").then((m) => ({ default: m.GroupPage }))
)
const LoansPage = lazy(() =>
  import("@/pages/loans").then((m) => ({ default: m.LoansPage }))
)
const LoanDetailsPage = lazy(() =>
  import("@/pages/loans/details").then((m) => ({
    default: m.LoanDetailsPage,
  }))
)
const MeetingsPage = lazy(() =>
  import("@/pages/meetings").then((m) => ({ default: m.MeetingsPage }))
)
const MeetingDetailsPage = lazy(() =>
  import("@/pages/meetings/details").then((m) => ({
    default: m.MeetingDetailsPage,
  }))
)
const MembersPage = lazy(() =>
  import("@/pages/members").then((m) => ({ default: m.MembersPage }))
)
const MemberDetailsPage = lazy(() =>
  import("@/pages/members/details").then((m) => ({
    default: m.MemberDetailsPage,
  }))
)
const ProfilePage = lazy(() =>
  import("@/pages/profile").then((m) => ({ default: m.ProfilePage }))
)
const ReportsPage = lazy(() =>
  import("@/pages/reports").then((m) => ({ default: m.ReportsPage }))
)
const StatementsPage = lazy(() =>
  import("@/pages/statements").then((m) => ({ default: m.StatementsPage }))
)
const ShareOutPage = lazy(() =>
  import("@/pages/share-out").then((m) => ({ default: m.ShareOutPage }))
)
const InvitationsPage = lazy(() =>
  import("@/pages/invitations").then((m) => ({ default: m.InvitationsPage }))
)
const JoinPage = lazy(() =>
  import("@/pages/auth/join").then((m) => ({ default: m.JoinPage }))
)
const RecordPage = lazy(() =>
  import("@/pages/record").then((m) => ({ default: m.RecordPage }))
)
const SavingsPage = lazy(() =>
  import("@/pages/savings").then((m) => ({ default: m.SavingsPage }))
)

function PageLoading() {
  return (
    <div className="p-8">
      <LoadingSpinner />
    </div>
  )
}

export function App() {
  const { t } = useI18n()

  return (
    <BrowserRouter>
      <a
        href="#main-content"
        className="sr-only z-[100] rounded bg-primary px-4 py-3 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t("app.skipToContent")}
      </a>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/register/create-group" element={<CreateGroupPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Suspense fallback={<PageLoading />}>
                    <Outlet />
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/savings" element={<SavingsPage />} />
            <Route path="/savings/record" element={<RecordPage />} />
            <Route path="/loans" element={<LoansPage />} />
            <Route path="/loans/:loanId" element={<LoanDetailsPage />} />
            <Route path="/meetings" element={<MeetingsPage />} />
            <Route
              path="/meetings/:meetingId"
              element={<MeetingDetailsPage />}
            />
            <Route path="/fines" element={<FinesPage />} />
            <Route path="/statements" element={<StatementsPage />} />
            <Route
              path="/invitations"
              element={
                <RequireAction action="manageInvitations">
                  <InvitationsPage />
                </RequireAction>
              }
            />
            <Route path="/share-out" element={<ShareOutPage />} />
            <Route
              path="/reports"
              element={
                <RequireAction action="viewGroupFigures">
                  <ReportsPage />
                </RequireAction>
              }
            />
            <Route path="/group" element={<GroupPage />} />
            <Route path="/cycles" element={<CyclesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route
              path="/members"
              element={
                <RequireAction action="viewMembers">
                  <MembersPage />
                </RequireAction>
              }
            />
            <Route
              path="/members/:memberId"
              element={
                <RequireAction action="viewMembers">
                  <MemberDetailsPage />
                </RequireAction>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route
            path="/design-system"
            element={
              <div id="main-content">
                <DesignSystemPage />
              </div>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
