import { useMemo, useState } from "react";
import { Users, Download, BellRing, Badge } from "lucide-react";
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
} from "recharts";
import { downloadCSV } from "../utils";
import { TOKENS } from "../utils/data"; 
import { Card } from "../utils/ui/Card";
import { CardHeader } from "../utils/ui/CardHeader";
import { CardBody } from "../utils/ui/CardBody";
import { Input } from "../utils/ui/Input";
import { Button } from "../utils/ui/Button";
import { useAgentsData } from "../hooks/useAgentData";
import {LoadingSpinner } from "../utils/ui/loading-spinner";
import { Select } from "../utils/ui/Select";



export function Agents() {
  const currentYear = new Date().getFullYear();
  const { data, isLoading, isError, error } = useAgentsData(currentYear);
  console.log("data is ",data);
  const [query, setQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("All Teams");
  const [selectedAgent, setSelectedAgent] = useState(null);

  const filteredAgents = useMemo(() => {
    if (!data?.agents) return [];
    let list = data.agents;
    if (selectedTeam !== "All Teams") {
      list = list.filter((a) => a.team.includes(selectedTeam));
    }
    return list.filter((a) =>
      [a.name, a.team, a.id]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [query, selectedTeam, data]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  if (isError)
    return (
      <div className="text-center p-8 text-red-500">Error: {error.message}</div>
    );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Agent Performance"
          subtitle="Download individual reports • Compare vs team average"
          icon={<Users size={18} style={{ color: TOKENS.primary }} />}
          actions={
            <div className="flex items-center gap-2">
              <Select
                className="w-40"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
              >
                {data?.teams.map((team) => (
                  <option key={team.name} value={team.name}>
                    {team.name}
                  </option>
                ))}
              </Select>
              <div className="relative">
                <Input
                  className="pl-8 w-64"
                  placeholder="Search agents…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button
                variant="ghost"
                onClick={() =>
                  downloadCSV(
                    filteredAgents,
                    [
                      "id",
                      "name",
                      "team",
                      "leads",
                      "deals",
                      "calls",
                      "conv",
                      "commissionAED",
                    ],
                    "agents-report.csv"
                  )
                }
              >
                <Download size={16} className="inline mr-1" /> Export All
              </Button>
            </div>
          }
        />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAgents.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-2xl border hover:shadow-sm"
                style={{ borderColor: TOKENS.border }}
              >
                <div className="flex items-center gap-3">
                  <div>
                    <div
                      className="font-semibold"
                      style={{ color: TOKENS.text }}
                    >
                      {a.name}
                    </div>
                    <div className="text-xs" style={{ color: TOKENS.muted }}>
                      {a.team} • {a.id}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                  <div>
                    <div
                      className="text-[11px]"
                      style={{ color: TOKENS.muted }}
                    >
                      Leads
                    </div>
                    <div className="font-medium">{a.leads}</div>
                  </div>
                  <div>
                    <div
                      className="text-[11px]"
                      style={{ color: TOKENS.muted }}
                    >
                      Deals
                    </div>
                    <div className="font-medium">{a.deals}</div>
                  </div>
                  <div>
                    <div
                      className="text-[11px]"
                      style={{ color: TOKENS.muted }}
                    >
                      Calls
                    </div>
                    <div className="font-medium">{a.calls}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {a.conv}%
                  <span className="text-xs" style={{ color: TOKENS.muted }}>
                    Conversion
                  </span>
                </div>
                <div className="mt-3">
                  <Button variant="ghost" onClick={() => setSelectedAgent(a)}>
                    Open Report Card
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
      <AgentReportCardModal
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
      />
      <Card>
        <CardHeader
          title="Coaching Opportunities"
          icon={<BellRing size={18} style={{ color: TOKENS.redAccent }} />}
        />
        <CardBody>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Auto‑flag missed leads &gt; 3 or response time &gt; 24h</li>
            <li>Listing Quality Score &lt; 85 triggers review task</li>
            <li>Low activity week: prompt call blitz challenge</li>
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}

function AgentReportCardModal({ agent, onClose }) {
  if (!agent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div
          className="p-4 border-b sticky top-0 bg-white z-10"
          style={{ borderColor: TOKENS.border }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h3
                  className="text-xl font-bold"
                  style={{ color: TOKENS.text }}
                >
                  {agent.name} — Report Card
                </h3>
                <p className="text-sm" style={{ color: TOKENS.muted }}>
                  {agent.team} • {agent.id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() =>
                  downloadCSV(
                    [agent],
                    ["id", "name", "team", "leads", "deals", "calls", "conv"],
                    `${agent.name}_report.csv`
                  )
                }
              >
                CSV
              </Button>
              <Button variant="ghost">PDF</Button>
              <Button variant="ghost" onClick={onClose}>
                <X size={16} />
              </Button>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div
              className="p-4 rounded-xl border"
              style={{ borderColor: TOKENS.border }}
            >
              <p className="text-sm" style={{ color: TOKENS.muted }}>
                Leads
              </p>
              <p
                className="text-2xl font-semibold"
                style={{ color: TOKENS.text }}
              >
                {agent.leads}
              </p>
            </div>
            <div
              className="p-4 rounded-xl border"
              style={{ borderColor: TOKENS.border }}
            >
              <p className="text-sm" style={{ color: TOKENS.muted }}>
                Deals
              </p>
              <p
                className="text-2xl font-semibold"
                style={{ color: TOKENS.text }}
              >
                {agent.deals}
              </p>
            </div>
            <div
              className="p-4 rounded-xl border"
              style={{ borderColor: TOKENS.border }}
            >
              <p className="text-sm" style={{ color: TOKENS.muted }}>
                Calls
              </p>
              <p
                className="text-2xl font-semibold"
                style={{ color: TOKENS.text }}
              >
                {agent.calls}
              </p>
            </div>
            <div
              className="p-4 rounded-xl border"
              style={{ borderColor: TOKENS.border }}
            >
              <p className="text-sm" style={{ color: TOKENS.muted }}>
                Conversion
              </p>
              <p
                className="text-2xl font-semibold"
                style={{ color: TOKENS.text }}
              >
                {agent.conv}%
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader title="Monthly Trends" />
              <CardBody>
                <div style={{ height: "250px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={agent.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="leads"
                        stroke={TOKENS.primary}
                      />
                      <Line
                        type="monotone"
                        dataKey="deals"
                        stroke={TOKENS.redAccent}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Lead Sources" />
              <CardBody>
                <div style={{ height: "250px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={agent.leadSourcesData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                      >
                        {agent.leadSourcesData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          </div>
          <Card>
            <CardHeader title="Activity Mix" />
            <CardBody>
              <div style={{ height: "250px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agent.activityMixData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {agent.activityMixData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
          {/* Summary Card */}
        </div>
      </div>
    </div>
  );
}
