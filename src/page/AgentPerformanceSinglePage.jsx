import { useState, useMemo } from "react";
import { Card } from "../utils/ui/Card";
import { CardHeader } from "../utils/ui/CardHeader";
import { Select } from "../utils/ui/Select";
import { CardBody } from "../utils/ui/CardBody";
import { Users, FileBarChart, Loader2, AlertCircle } from "lucide-react";
import { TOKENS } from "../utils/data"; 
import { useAgentReport } from '../hooks/useAgentReport'; 

const ALL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function AgentPerformanceSinglePage() {
  const { agents, report, loading, error } = useAgentReport();
  const [selectedAgentId, setSelectedAgentId] = useState("");

  const selectedAgent = useMemo(() => {
    if (!selectedAgentId || !report[selectedAgentId]) return null;

    const rawData = report[selectedAgentId];

    return {
      id: rawData.id,
      name: rawData.name,
      monthly: ALL_MONTHS.map((m) => ({
        month: m,
        grossComm: rawData.monthly[m]?.commission || 0, 
      })),
      quarterly: ["Q1", "Q2", "Q3", "Q4"].map((q) => ({
        quarter: q,
        grossComm: rawData.quarterly[q]?.comm || 0,
      })),
      yearly: {
        grossComm: rawData.yearly?.grossComm || rawData.totalCommission || 0,
      },
    };
  }, [selectedAgentId, report]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 gap-2">
        <Loader2 className="animate-spin" /> Loading All Agents Data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500 gap-2">
        <AlertCircle /> Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Select Agent"
          icon={<Users size={18} style={{ color: TOKENS.primary }} />}
        />
        <CardBody>
          <div className="flex items-center gap-4">
            <label
              htmlFor="selectAgent"
              className="w-24 text-sm"
              style={{ color: TOKENS.muted }}
            >
              Select Agent:
            </label>
            <Select
              id="selectAgent"
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full md:w-1/2 lg:w-1/3"
            >
              <option value="">-- Select an agent --</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </Select>
            <span className="text-xs text-gray-400">({agents.length} Active Agents)</span>
          </div>
        </CardBody>
      </Card>

      {selectedAgent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          
          <Card>
            <CardHeader
              title="Monthly Performance"
              icon={<FileBarChart size={18} style={{ color: TOKENS.primary }} />}
            />
            <CardBody className="p-0">
              <p className="px-4 py-2 text-sm font-semibold" style={{ color: TOKENS.text }}>
                {selectedAgent.name}
              </p>
              <div className="overflow-auto max-h-[300px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr>
                      <th className="py-2 px-3 font-semibold text-left border-b" style={{ backgroundColor: TOKENS.bg, color: TOKENS.muted, borderColor: TOKENS.border }}>Month</th>
                      <th className="py-2 px-3 font-semibold text-left border-b" style={{ backgroundColor: TOKENS.bg, color: TOKENS.muted, borderColor: TOKENS.border }}>Gross Comm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAgent.monthly.map((m) => (
                      <tr key={m.month} className="border-b" style={{ borderColor: TOKENS.border }}>
                        <td className="py-2 px-3">{m.month}</td>
                        <td className="py-2 px-3">
                          AED {m.grossComm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Quarterly Performance"
              icon={<FileBarChart size={18} style={{ color: TOKENS.primary }} />}
            />
            <CardBody className="p-0">
              <p className="px-4 py-2 text-sm font-semibold" style={{ color: TOKENS.text }}>
                {selectedAgent.name}
              </p>
              <div className="overflow-auto max-h-[300px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr>
                      <th className="py-2 px-3 font-semibold text-left border-b" style={{ backgroundColor: TOKENS.bg, color: TOKENS.muted, borderColor: TOKENS.border }}>Quarter</th>
                      <th className="py-2 px-3 font-semibold text-left border-b" style={{ backgroundColor: TOKENS.bg, color: TOKENS.muted, borderColor: TOKENS.border }}>Gross Comm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAgent.quarterly.map((q) => (
                      <tr key={q.quarter} className="border-b" style={{ borderColor: TOKENS.border }}>
                        <td className="py-2 px-3">{q.quarter}</td>
                        <td className="py-2 px-3">
                          AED {q.grossComm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Yearly Performance"
              icon={<FileBarChart size={18} style={{ color: TOKENS.primary }} />}
            />
            <CardBody className="p-0">
              <p className="px-4 py-2 text-sm font-semibold" style={{ color: TOKENS.text }}>
                {selectedAgent.name}
              </p>
              <div className="overflow-auto max-h-[300px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr>
                      <th className="py-2 px-3 font-semibold text-left border-b" style={{ backgroundColor: TOKENS.bg, color: TOKENS.muted, borderColor: TOKENS.border }}>Year</th>
                      <th className="py-2 px-3 font-semibold text-left border-b" style={{ backgroundColor: TOKENS.bg, color: TOKENS.muted, borderColor: TOKENS.border }}>Gross Comm</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b" style={{ borderColor: TOKENS.border }}>
                      <td className="py-2 px-3">{new Date().getFullYear()}</td>
                      <td className="py-2 px-3">
                        AED {selectedAgent.yearly.grossComm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}