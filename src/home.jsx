import React, { useMemo, useState } from "react";
import {
  LayoutGrid,
  Users,
  Target,
  Banknote,
  ShieldCheck,
  FileBarChart,
  Settings,
  Download,
  Search,
  Filter,
  BellRing,
  TrendingUp,
  Building2,
  CalendarClock,
  Briefcase,
  Layers,
  BarChart2,
  ListOrdered,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  ComposedChart, // Import ComposedChart
} from "recharts";

import {csvEscape,MGMT_CHART_COLORS,CHART_COLORS,AGENT_PERFORMANCE_DATA,DEALS_MONITORING_DATA,generatedDeals,propertyTypesGen,invoiceStatuses,paymentReceivedStatuses,dealTypes,leadSources,DEALS_MONITORING_DATA_ORIGINAL,ALL_PROPERTY_TYPES, ALL_DEVELOPERS,allDevsFromCSV,csvDevList,existingShortlist,NEW_TEAM_STRUCTURE, TOKENS,ALL_LEADERS, OTHER_ADMINS ,generateMockAgent, newAgentsAndAdmins,AGENTS_AND_ADMINS,AGENTS,ADMINS,TEAMS,UNASSIGNED_AGENTS,LEADS,FUNNEL} from "./utils/data";
import {Card} from './utils/ui/Card';
import { CardHeader } from "./utils/ui/CardHeader";
import { CardBody } from "./utils/ui/CardBody";
import { Button } from "./utils/ui/Button";
import { Input } from "./utils/ui/Input";
import { Select } from "./utils/ui/Select";
import { Badge } from "./utils/ui/Badge";
import { UnifiedOverviewPageWrapper } from "./page/UnifiedOverviewPageWrapper";
import {DealsMonitoringPageWrapper} from "./page/DealsMonitoringPageWrapper";
import { AgentRankingPage } from "./page/AgentRankingPage";
import { AgentPerformanceSinglePage } from "./page/AgentPerformanceSinglePage";
import { AgentReportPagePageWrapper } from "./page/AgentReportPageWrapper";
import {AgentLastTransactionPageWrapper} from "./page/AgentLastTransactionPageWrapper";
import { PipelineWrapper } from "./page/PipelineWrapper";
import { TeamsPageWrapper } from "./page/TeamsPageWrapper";


const TABS = [
  { key: "overview", label: "Overview", icon: <LayoutGrid size={16} /> },
  {
    key: "deals-monitoring",
    label: "Deals Monitoring",
    icon: <Layers size={16} />,
  },
  // REQ V7: Renamed "Agent Performance" to "Agent Ranking"
  {
    key: "agent-ranking",
    label: "Agent Ranking",
    icon: <ListOrdered size={16} />,
  },
  // REQ V8: Add new Agent Performance tab
  {
    key: "agent-performance-single",
    label: "Agent Performance",
    icon: <FileBarChart size={16} />,
  },
  // REQ 4: "Agent Performance" renamed to "Individual Agent Report"
  // REQ V19: Renamed "Individual Agent Report" to "Agent Report"
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



export default function RealEstateAdminApp() {
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
      <header
        className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b"
        style={{ borderColor: TOKENS.border }}
      >
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
              style={{ backgroundColor: TOKENS.primary, color: TOKENS.white }}
            >
              VW
            </div>
            <div>
              <div className="text-sm" style={{ color: TOKENS.muted }}>
                VortexWeb
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
              <Search
                size={16}
                className="absolute left-3 top-2.5"
                style={{ color: TOKENS.muted }}
              />
              <Input
                className="pl-8 w-72"
                placeholder="Search agents, listings, leads…"
              />
            </div>
            <Button variant="ghost">New</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pt-4">
        {/* REQ 4: TABS array is updated, this will render correctly */}
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

      <main className="mx-auto max-w-7xl px-4 py-6">{Current}</main>

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
