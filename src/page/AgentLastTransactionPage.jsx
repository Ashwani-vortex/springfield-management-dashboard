import { useMemo, useState } from "react";
import { Download, BarChart2 } from "lucide-react";
import { downloadCSV } from "../utils/index";
import { useAgentLastTransactionData } from "../hooks/useAgentLastTransactionData";
import { Button } from "../utils/ui/Button";
import { Card } from "../utils/ui/Card";
import { CardBody } from "../utils/ui/CardBody";
import { CardHeader } from "../utils/ui/CardHeader";
import { Input } from "../utils/ui/Input";
import { Select } from "../utils/ui/Select";
import { Table } from "../utils/ui/table";
import { LoadingSpinner } from "../utils/ui/loading-spinner";
import { TOKENS } from "../utils/data";

const formatCurrency = (value) =>
  `AED ${new Intl.NumberFormat("en-AE").format(value || 0)}`;

export function AgentLastTransactionPage() {
  const currentYear = new Date().getFullYear();
  const { data, isLoading, isError, error } = useAgentLastTransactionData(currentYear);

  const [query, setQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("All");
  const [selectedAgent, setSelectedAgent] = useState("All");

  // 1. Filter: Get agents who actually have a transaction
  const agentsWithTransactions = useMemo(() => {
    if (!data?.agents) return [];
    return data.agents.filter((agent) => agent.lastTransactionDate !== null);
  }, [data]);

  // 2. Filter: Apply Search and Dropdowns
  const filteredAgents = useMemo(() => {
    let list = agentsWithTransactions;

    if (selectedTeam !== "All") {
      list = list.filter((agent) => agent.team.includes(selectedTeam));
    }
    if (selectedAgent !== "All") {
      list = list.filter((agent) => String(agent.id) === String(selectedAgent));
    }

    return list.filter((agent) =>
      [agent.name, agent.team, agent.hired_by, agent.joining_date, agent.lastTransactionProject]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [query, selectedTeam, selectedAgent, agentsWithTransactions]);

  // FIX: Use 'columns' structure instead of 'headers' for stability
  const columns = [
    { header: "Agent", key: "name" },
    { header: "Team", key: "team" },
    { header: "Hired by", key: "hired_by" },
    { header: "Joining Date", key: "joining_date" },
    { header: "Last Deal Date", key: "lastTransactionDate" },
    { header: "Project", key: "lastTransactionProject" },
    { 
      header: "Property Price", 
      key: "lastTransactionAmount", 
      render: (val) => formatCurrency(val) 
    },
    { 
      header: "Gross Commission", 
      key: "grossCommission", 
      render: (val) => formatCurrency(val) 
    },
  ];

  const exportHeaders = [
    "name",
    "team",
    "lastTransactionDate",
    "lastTransactionProject",
    "lastTransactionAmount",
    "grossCommission",
  ];

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
          title="Agent Last Transaction"
          icon={<BarChart2 size={18} style={{ color: TOKENS.primary }} />}
          actions={
            <div className="flex items-center gap-2">
              <Select
                className="w-40"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
              >
                <option value="All">All Teams</option>
                {data?.teams.map((team) => (
                  <option key={team.name} value={team.name}>
                    {team.name}
                  </option>
                ))}
              </Select>
              <Select
                className="w-40"
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
              >
                <option value="All">All Agents</option>
                {agentsWithTransactions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
              <div className="relative">
                <Input
                  className="pl-8 w-48"
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button
                variant="ghost"
                onClick={() =>
                  downloadCSV(filteredAgents, exportHeaders, "agent-last-transaction.csv")
                }
              >
                <Download size={16} className="inline mr-1" /> Export
              </Button>
            </div>
          }
        />
        <CardBody>
          {/* Pass columns and data directly. The Table component handles the rest. */}
          <Table columns={columns} data={filteredAgents} />
        </CardBody>
      </Card>
    </div>
  );
}