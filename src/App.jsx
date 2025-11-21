import React, { useMemo, useState } from "react";
import "./App.css"; // Ensure your CSS is imported
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Import React Query

// Icons
import {
  LayoutGrid,
  Users,
  Target,
  FileBarChart,
  Search,
  TrendingUp,
  Layers,
  BarChart2,
  ListOrdered,
} from "lucide-react";

// Import Data & Utils
import { TOKENS } from "./utils/data";
import { Button } from "./utils/ui/Button";
import { Input } from "./utils/ui/Input";

// Import Page Wrappers
import { UnifiedOverviewPageWrapper } from "./page/UnifiedOverviewPageWrapper";
import { DealsMonitoringPageWrapper } from "./page/DealsMonitoringPageWrapper";
import { AgentRankingPage } from "./page/AgentRankingPage";
import { AgentPerformanceSinglePage } from "./page/AgentPerformanceSinglePage";
import { AgentReportPagePageWrapper } from "./page/AgentReportPageWrapper";
import { AgentLastTransactionPageWrapper } from "./page/AgentLastTransactionPageWrapper";
import { PipelineWrapper } from "./page/PipelineWrapper";
import { TeamsPageWrapper } from "./page/TeamsPageWrapper";

// --- 1. Initialize React Query Client ---
const queryClient = new QueryClient();

// --- 2. Define Tabs Configuration ---
const TABS = [
  { key: "overview", label: "Overview", icon: <LayoutGrid size={16} /> },
  {
    key: "deals-monitoring",
    label: "Deals Monitoring",
    icon: <Layers size={16} />,
  },
  {
    key: "agent-ranking",
    label: "Agent Ranking",
    icon: <ListOrdered size={16} />,
  },
  {
    key: "agent-performance-single",
    label: "Agent Performance",
    icon: <FileBarChart size={16} />,
  },
  {
    key: "individual-agent-report",
    label: "Agent Report",
    icon: <TrendingUp size={16} />,
  },
  {
    key: "agent-last-transaction",
    label: "Agent Last Transaction",
    icon: <BarChart2 size={16} />,
  },
  { key: "teams", label: "Teams", icon: <Users size={16} /> },
  { key: "pipeline", label: "Pipeline", icon: <Target size={16} /> },
];

// --- 3. Internal Dashboard Component ---
// This contains all the UI logic previously in home.jsx
function Dashboard() {
  const [tab, setTab] = useState("overview");

  const Current = useMemo(() => {
    switch (tab) {
      case "overview":
        return <UnifiedOverviewPageWrapper />;
      case "deals-monitoring":
        return <DealsMonitoringPageWrapper />;
      case "agent-ranking":
        return <AgentRankingPage />;
      case "agent-performance-single":
        return <AgentPerformanceSinglePage />;
      case "individual-agent-report":
        return <AgentReportPagePageWrapper />;
      case "agent-last-transaction":
        return <AgentLastTransactionPageWrapper />;
      case "teams":
        return <TeamsPageWrapper />;
      case "pipeline":
        return <PipelineWrapper />;
      default:
        return <UnifiedOverviewPageWrapper />;
    }
  }, [tab]);

  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor: TOKENS.bg }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b"
        style={{ borderColor: TOKENS.border }}
      >
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
              style={{ backgroundColor: "#003366", color: TOKENS.white }}
            >
              RE
            </div>
            <div>
              <div className="text-sm" style={{ color: TOKENS.muted }}>
                Springfield Properties
              </div>
              <div
                className="text-base font-semibold"
                style={{ color: TOKENS.text }}
              >
                Management Dashboard
              </div>
            </div>
          </div>
          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              {/* <Search
                size={16}
                className="absolute left-3 top-2.5"
                style={{ color: TOKENS.muted }}
              /> */}
              <Input
                className="pl-8 w-72"
                placeholder="Search agents, listings, leads…"
              />
            </div>
            <Button variant="ghost">New</Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-2 rounded-xl text-sm border flex items-center gap-2 whitespace-nowrap ${
                tab === t.key ? "font-semibold" : ""
              }`}
              style={{
                borderColor: TOKENS.border,
                backgroundColor:
                  tab === t.key ? TOKENS.primarySoft : TOKENS.white,
                color: tab === t.key ? TOKENS.primary : TOKENS.text,
              }}
            >
              <span
                className="shrink-0"
                style={{ color: tab === t.key ? TOKENS.primary : TOKENS.muted }}
              >
                {t.icon}
              </span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6">{Current}</main>

      {/* Footer */}
      <footer
        className="py-8 text-center text-xs"
        style={{ color: TOKENS.muted }}
      >
        © {new Date().getFullYear()} VortexWeb • Real Estate Management
        Dashboard
      </footer>
    </div>
  );
}

// --- 4. Main App Component ---
// This wraps the dashboard with the Data Provider
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}

export default App;