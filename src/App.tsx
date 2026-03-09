import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GRCProvider } from "@/lib/grc-provider";
import { AuthProvider } from "@/lib/auth-provider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GRCLayout } from "@/components/GRCLayout";
import Dashboard from "./pages/Dashboard";
import AssetsPage from "./pages/AssetsPage";
import RisksPage from "./pages/RisksPage";
import IncidentsPage from "./pages/IncidentsPage";
import AuditsPage from "./pages/AuditsPage";
import CompliancePage from "./pages/CompliancePage";
import GovernancePage from "./pages/GovernancePage";
import ActionsPage from "./pages/ActionsPage";
import PerformancePage from "./pages/PerformancePage";
import DocumentsPage from "./pages/DocumentsPage";
import TrainingPage from "./pages/TrainingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminPage from "./pages/AdminPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedPage({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <GRCLayout>{children}</GRCLayout>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <GRCProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
              <Route path="/assets" element={<ProtectedPage><AssetsPage /></ProtectedPage>} />
              <Route path="/risks" element={<ProtectedPage><RisksPage /></ProtectedPage>} />
              <Route path="/incidents" element={<ProtectedPage><IncidentsPage /></ProtectedPage>} />
              <Route path="/audits" element={<ProtectedPage><AuditsPage /></ProtectedPage>} />
              <Route path="/compliance" element={<ProtectedPage><CompliancePage /></ProtectedPage>} />
              <Route path="/governance" element={<ProtectedPage><GovernancePage /></ProtectedPage>} />
              <Route path="/actions" element={<ProtectedPage><ActionsPage /></ProtectedPage>} />
              <Route path="/performance" element={<ProtectedPage><PerformancePage /></ProtectedPage>} />
              <Route path="/documents" element={<ProtectedPage><DocumentsPage /></ProtectedPage>} />
              <Route path="/training" element={<ProtectedPage><TrainingPage /></ProtectedPage>} />
              <Route path="/admin" element={<ProtectedPage><AdminPage /></ProtectedPage>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </GRCProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
