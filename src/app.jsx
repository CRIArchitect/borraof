import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./context/authcontext";
import ProtectedRoute from "./components/common/protectedroute";
import AppShell from "./components/layout/appshell";
import LoadingState from "./components/common/loadingstate";

import LandingPage from "./pages/landingpage";
import LoginPage from "./pages/loginpage";
import RegisterPage from "./pages/registerpage";
import WaitlistPage from "./pages/waitlistpage";

const DashboardPage = lazy(() => import("./pages/dashboardpage"));
const CompanyFormPage = lazy(() => import("./pages/companyformpage"));
const GeneratePage = lazy(() => import("./pages/generatepage"));
const EstudioPage = lazy(() => import("./pages/estudiopage"));
const HistoryPage = lazy(() => import("./pages/historypage"));
const AdminPage = lazy(() => import("./pages/adminpage"));
const NotFoundPage = lazy(() => import("./pages/notfoundpage"));

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<LoadingState />}>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/app" replace /> : <LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/waitlist" element={<WaitlistPage />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="companies/new" element={<CompanyFormPage />} />
          <Route path="companies/:id/edit" element={<CompanyFormPage />} />
          <Route path="generate" element={<GeneratePage />} />
          <Route path="estudio" element={<EstudioPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route
            path="admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
