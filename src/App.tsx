import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GRCProvider } from "@/lib/grc-provider";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GRCProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<GRCLayout><Dashboard /></GRCLayout>} path="/" />
            <Route element={<GRCLayout><AssetsPage /></GRCLayout>} path="/assets" />
            <Route element={<GRCLayout><RisksPage /></GRCLayout>} path="/risks" />
            <Route element={<GRCLayout><IncidentsPage /></GRCLayout>} path="/incidents" />
            <Route element={<GRCLayout><AuditsPage /></GRCLayout>} path="/audits" />
            <Route element={<GRCLayout><CompliancePage /></GRCLayout>} path="/compliance" />
            <Route element={<GRCLayout><GovernancePage /></GRCLayout>} path="/governance" />
            <Route element={<GRCLayout><ActionsPage /></GRCLayout>} path="/actions" />
            <Route element={<GRCLayout><PerformancePage /></GRCLayout>} path="/performance" />
            <Route element={<GRCLayout><DocumentsPage /></GRCLayout>} path="/documents" />
            <Route element={<GRCLayout><TrainingPage /></GRCLayout>} path="/training" />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </GRCProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
