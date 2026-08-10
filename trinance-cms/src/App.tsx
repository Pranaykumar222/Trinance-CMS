import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { RoleGate } from "@/components/layout/RoleGate";

import Dashboard from "@/pages/Dashboard";
import NewslettersList from "@/pages/NewslettersList";
import NewsletterEditor from "@/pages/NewsletterEditor";
import Subscribers from "@/pages/Subscribers";
import Analytics from "@/pages/Analytics";
import Team from "@/pages/Team";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

function ProtectedApp() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Login />;

  return (
    <Routes>
      {/* Full-screen editor routes (own chrome) */}
      <Route path="/newsletters/new" element={<NewsletterEditor />} />
      <Route path="/newsletters/:id/edit" element={<NewsletterEditor />} />

      {/* Main app shell */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/newsletters" element={<NewslettersList />} />
        <Route
          path="/subscribers"
          element={
            <RoleGate allow={["owner", "admin", "editor"]}>
              <Subscribers />
            </RoleGate>
          }
        />
        <Route
          path="/analytics"
          element={
            <RoleGate allow={["owner", "admin", "editor"]}>
              <Analytics />
            </RoleGate>
          }
        />
        <Route
          path="/team"
          element={
            <RoleGate allow={["owner", "admin"]}>
              <Team />
            </RoleGate>
          }
        />
        <Route
          path="/settings"
          element={
            <RoleGate allow={["owner", "admin"]}>
              <Settings />
            </RoleGate>
          }
        />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <TooltipProvider delayDuration={200}>
            <ProtectedApp />
            <Toaster
              position="bottom-right"
              richColors
              closeButton
              toastOptions={{ style: { borderRadius: "0.7rem" } }}
            />
          </TooltipProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
