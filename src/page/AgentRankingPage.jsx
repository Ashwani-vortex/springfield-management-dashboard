import { useState, useMemo } from "react";
import { useAgentRanking } from "../hooks/useAgentRanking";
import { TOKENS } from "../utils/data"; 
import { Card } from "../utils/ui/Card";
import { CardHeader } from "../utils/ui/CardHeader";
import { CardBody } from "../utils/ui/CardBody";
import { Input } from "../utils/ui/Input";
import { Search, ListOrdered, ArrowUpDown, ArrowUp, ArrowDown, Loader2, AlertCircle, X } from "lucide-react";
import { Button } from "../utils/ui/Button";

// Helper for month names matching your API
const MONTH_MAP = [
  { full: "January", short: "Jan" },
  { full: "February", short: "Feb" },
  { full: "March", short: "Mar" },
  { full: "April", short: "Apr" },
  { full: "May", short: "May" },
  { full: "June", short: "Jun" },
  { full: "July", short: "Jul" },
  { full: "August", short: "Aug" },
  { full: "September", short: "Sep" },
  { full: "October", short: "Oct" },
  { full: "November", short: "Nov" },
  { full: "December", short: "Dec" },
];

// ----------------------------------------------------------------------------
// Modal Component
// ----------------------------------------------------------------------------
function AgentReportModal({ agent, onClose }) {
  if (!agent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-xl font-bold">{agent.name} — Agent Report</h3>
            <p className="text-sm text-gray-500">ID: {agent.id}</p>
          </div>
          <Button variant="ghost" onClick={onClose}><X size={16} /></Button>
        </div>
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 border rounded-xl">
                    <p className="text-sm text-gray-500">Total Deals</p>
                    <p className="text-2xl font-bold">{agent.yearly.deals}</p>
                </div>
                <div className="p-4 border rounded-xl">
                    <p className="text-sm text-gray-500">Total Volume</p>
                    <p className="text-2xl font-bold">AED {agent.yearly.grossComm.toLocaleString()}</p>
                </div>
                <div className="p-4 border rounded-xl">
                    <p className="text-sm text-gray-500">Avg Deal Value</p>
                    <p className="text-2xl font-bold">
                        AED {agent.yearly.deals > 0 
                            ? (agent.yearly.grossComm / agent.yearly.deals).toLocaleString(undefined, {maximumFractionDigits:0}) 
                            : 0}
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Main Page Component
// ----------------------------------------------------------------------------
export function AgentRankingPage() {
  const { data: apiData, loading, error } = useAgentRanking();

  const [query, setQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "yearly.grossComm",
    direction: "desc",
  });
  const [selectedAgent, setSelectedAgent] = useState(null);

  // ----------------------------------------------------------
  // 1. FIX: Robust Data Transformation
  // ----------------------------------------------------------
  const tableData = useMemo(() => {
    if (!apiData || Object.keys(apiData).length === 0) return [];

    return Object.values(apiData).map((agent) => {
      
      // Process Monthly
      const monthly = MONTH_MAP.map((m) => {
        const d = agent.monthly?.[m.full] || { opportunity: 0, commission: 0, deals: 0 };
        return {
          opportunity: d.opportunity,
          commission: d.commission,
          deals: d.deals,
        };
      });

      // Process Quarterly (Fixing the key mismatch: API uses 'opp', UI wants 'opportunity')
      const quarters = ["Q1", "Q2", "Q3", "Q4"];
      const quarterly = quarters.map(q => {
        const d = agent.quarterly?.[q] || { opp: 0, comm: 0, deals: 0 };
        return {
            quarter: q,
            opportunity: d.opp,  // Mapped 'opp' from API
            commission: d.comm,  // Mapped 'comm' from API
            deals: d.deals
        }
      });

      return {
        id: agent.id,
        name: agent.name,
        monthly, 
        quarterly, // Now an array, ready to map
        yearly: {
          grossComm: agent.totalOpportunity || 0,
          deals: agent.totalDeals || 0,
        },
      };
    })
    .sort((a, b) => b.yearly.grossComm - a.yearly.grossComm)
    .map((item, i) => ({ ...item, rank: i + 1 }));
  }, [apiData]);


  // Filter & Sort Logic
  const filteredAndSortedAgents = useMemo(() => {
    let sorted = [...tableData].filter((agent) =>
      agent.name.toLowerCase().includes(query.toLowerCase())
    );

    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aValue = a;
        let bValue = b;
        const keys = sortConfig.key.split(".");
        keys.forEach(k => {
            aValue = aValue ? aValue[k] : 0;
            bValue = bValue ? bValue[k] : 0;
        });

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [tableData, query, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className="ml-1 opacity-30" />;
    return sortConfig.direction === "asc" ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />;
  };

  // ----------------------------------------------------------
  // 2. FIX: Corrected Headers (Removed Duplicates)
  // ----------------------------------------------------------
  const headers = [
    { key: "rank", label: "Rank", width: "w-12" },
    { key: "name", label: "Agent", width: "w-48 sticky left-0" },
    // ONLY MAP ONCE for Monthly
    ...MONTH_MAP.map(m => ({ key: null, label: m.short })),
    // Add Quarters
    ...["Q1","Q2","Q3","Q4"].map(q => ({ key: null, label: q })),
    { key: "yearly.grossComm", label: "Total Value" },
    { key: "yearly.deals", label: "Total Deals" },
  ];  

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;
  if (error) return <div className="p-4 text-red-500 border border-red-200 rounded bg-red-50">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Agent Ranking"
          icon={<ListOrdered size={18} style={{ color: TOKENS.primary }} />}
          actions={
            <div className="relative">
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <Input
                className="pl-8 w-64"
                placeholder="Search agents..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          }
        />
        <CardBody className="p-0">
          <div className="overflow-auto max-h-[75vh] relative">
            <table className="min-w-full text-sm whitespace-nowrap">
              <thead className="sticky top-0 z-20 bg-gray-50 shadow-sm">
                <tr>
                  {headers.map((h, i) => (
                    <th
                      key={i}
                      className={`py-3 px-3 font-semibold text-left border-b text-xs uppercase tracking-wider ${h.width || ''} ${h.key ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                      style={{ color: TOKENS.muted }}
                      onClick={() => h.key && requestSort(h.key)}
                    >
                      <div className="flex items-center">
                        {h.label}
                        {h.key && getSortIcon(h.key)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedAgents.map((agent) => (
                  <tr key={agent.id} className="border-b hover:bg-gray-50 transition-colors group">
                    
                    <td className="py-2 px-3 font-bold text-gray-400">{agent.rank}</td>
                    
                    <td className="py-2 px-3 sticky left-0 bg-white group-hover:bg-gray-50 z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      <button 
                        onClick={() => setSelectedAgent(agent)}
                        className="font-semibold text-blue-600 hover:underline text-left truncate w-full"
                      >
                        {agent.name}
                      </button>
                    </td>

                    {/* ---------------------------------------------------------- */}
                    {/* 3. FIX: Render Monthly Data */}
                    {/* ---------------------------------------------------------- */}
                    {agent.monthly.map((m, idx) => (
                      <td key={`m-${idx}`} className="p-1">
                        <div className={`p-1.5 rounded-lg text-center min-w-[90px] ${m.deals > 0 ? 'bg-blue-50 border border-blue-100' : 'opacity-30'}`}>
                          <div className="text-[10px] text-gray-700 font-medium">
                            {m.opportunity > 0 ? `${m.opportunity }AED` : "-"}
                          </div>
                          <div className={`text-[10px] font-bold ${m.deals > 0 ? 'text-blue-600' : 'text-transparent'}`}>
                            {m.deals}
                          </div>
                        </div>
                      </td>
                    ))}

                    {/* ---------------------------------------------------------- */}
                    {/* 4. FIX: Render Quarterly Data (Was Missing) */}
                    {/* ---------------------------------------------------------- */}
                    {agent.quarterly.map((q, idx) => (
                      <td key={`q-${idx}`} className="p-1">
                        <div className={`p-1.5 rounded-lg text-center min-w-[90px] ${q.deals > 0 ? 'bg-purple-50 border border-purple-100' : 'opacity-30'}`}>
                          <div className="text-[10px] text-purple-900 font-medium">
                            {q.opportunity > 0 ? `${q.opportunity}AED` : "-"}
                          </div>
                          <div className={`text-[10px] font-bold ${q.deals > 0 ? 'text-purple-600' : 'text-transparent'}`}>
                            {q.deals}
                          </div>
                        </div>
                      </td>
                    ))}

                    <td className="py-2 px-3 font-bold text-gray-700">
                        AED {agent.yearly.grossComm.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 font-bold text-center">
                        <span className="bg-green-100 text-green-700 py-1 px-2 rounded-full text-xs">
                            {agent.yearly.deals}
                        </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <AgentReportModal
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
      />
    </div>
  );
}