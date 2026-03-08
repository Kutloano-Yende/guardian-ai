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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GRCProvider>
        <BrowserRouter>
          <GRCLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/assets" element={<AssetsPage />} />
              <Route path="/risks" element={<RisksPage />} />
              <Route path="/incidents" element={<IncidentsPage />} />
              <Route path="/audits" element={<AuditsPage />} />
              <Route path="/compliance" element={<CompliancePage />} />
              <Route path="/governance" element={<GovernancePage />} />
              <Route path="/actions" element={<ActionsPage />} />
              <Route path="/performance" element={<PerformancePage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/training" element={<TrainingPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </GRCLayout>
        </BrowserRouter>
      </GRCProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
