import { useState, useEffect } from "react";
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
  CartesianGrid,
  Legend,
} from "recharts";
import { Search, Filter } from "lucide-react";
import { TOKENS, CHART_COLORS, ALL_DEVELOPERS } from "../utils/data";
import { Card } from "../utils/ui/Card";
import { CardHeader } from "../utils/ui/CardHeader";
import { CardBody } from "../utils/ui/CardBody";
import { LoadingSpinner } from "../utils/ui/loading-spinner";
import { Table } from "../utils/ui/table";
import { useManagementData } from "../hooks/useOverviewData";
import KPI from "../utils/ui/KPI";
import { Select } from "../utils/ui/Select";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
};

export function UnifiedOverviewPage() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [selectedDeveloper, setSelectedDeveloper] = useState("All");
  
  const [quarter, setQuarter] = useState("All");
  const [month, setMonth] = useState("All");
  const [dealType, setDealType] = useState("All");

  const [currentPage, setCurrentPage] = useState(1); 
  const [currentLeadPage, setCurrentLeadPage] = useState(1); 
  const [currentDevCommPage, setCurrentDevCommPage] = useState(1); 
  const [currentDevUnitsPage, setCurrentDevUnitsPage] = useState(1);
  const [currentAgentPage, setCurrentAgentPage] = useState(1);

  const PAGE_SIZE = 10;
  const LEAD_PAGE_SIZE = 9;
  const DEV_COMM_PAGE_SIZE = 8;
  const DEV_UNITS_PAGE_SIZE = 8;
  const AGENT_PAGE_SIZE = 8;

  useEffect(() => {
    setCurrentPage(1);
    setCurrentLeadPage(1);
    setCurrentDevCommPage(1);
    setCurrentDevUnitsPage(1);
    setCurrentAgentPage(1);
  }, [year, selectedDeveloper]);

  const { data, isLoading, isError, error } = useManagementData(year);

  const wonDealsColumns = [
    { header: "Month", key: "month" },
    { header: "Deals Won", key: "dealsWon" },
    { header: "Property Price", key: "propertyPrice", render: formatCurrency },
    { header: "Gross Commission", key: "grossCommission", render: formatCurrency },
    { header: "Net Commission", key: "netCommission", render: formatCurrency },
    { header: "Payment Received", key: "paymentReceived", render: formatCurrency },
    { header: "Amount Receivable", key: "amountReceivable", render: formatCurrency },
  ];

  const developersColumns = [
    { header: "Developer", key: "developer" },
    { header: "Total Property Value", key: "value", render: formatCurrency },
    { header: "Total Property Percentage", key: "percentage", render: (val) => `${val}%` },
  ];

  const leadSourceHeaders = [
    { header: "Lead Source", key: "name", render: (name, row, index) => (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: index < MGMT_CHART_COLORS.length ? MGMT_CHART_COLORS[index] : TOKENS.primary }} />
          {name}
        </div>
      )},
    { header: "Value (Deals)", key: "value" },
  ];

  const propertyTypeColumns = [
    { header: "Type", key: "type" },
    { header: "Units", key: "units" },
    { header: "Value (AED)", key: "value", render: formatCurrency },
  ];

  const devCommColumns = [
    { header: "Developer", key: "developer" },
    { header: "Gross Comm (AED)", key: "value", render: formatCurrency },
  ];

  const devUnitsColumns = [
    { header: "Developer", key: "developer" },
    { header: "Units", key: "value" }, 
  ];

  const agentColumns = [
    { header: "Agent", key: "agent" },
    { header: "Deal Value (AED)", key: "value", render: formatCurrency },
  ];

  const MGMT_CHART_COLORS = ["#003366", "#3b82f6", "#60a5fa"];

  if (isLoading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  if (isError) return <div className="text-center p-8 text-red-500">Error: {error.message}</div>;

  const filteredDevelopersData = (data?.developersData || []).filter(dev => selectedDeveloper === "All" || dev.developer === selectedDeveloper);
  const totalPages = Math.max(1, Math.ceil(filteredDevelopersData.length / PAGE_SIZE));
  const paginatedDevelopers = filteredDevelopersData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const leadData = data?.leadSourceData || [];
  const totalLeadPages = Math.max(1, Math.ceil(leadData.length / LEAD_PAGE_SIZE));
  const paginatedLeadData = leadData.slice((currentLeadPage - 1) * LEAD_PAGE_SIZE, currentLeadPage * LEAD_PAGE_SIZE);

  const devCommData = data?.developerCommissionData || [];
  const totalDevCommPages = Math.max(1, Math.ceil(devCommData.length / DEV_COMM_PAGE_SIZE));
  const paginatedDevCommData = devCommData.slice((currentDevCommPage - 1) * DEV_COMM_PAGE_SIZE, currentDevCommPage * DEV_COMM_PAGE_SIZE);

  const devUnitsData = data?.developerUnitsData || [];
  const totalDevUnitsPages = Math.max(1, Math.ceil(devUnitsData.length / DEV_UNITS_PAGE_SIZE));
  const paginatedDevUnitsData = devUnitsData.slice((currentDevUnitsPage - 1) * DEV_UNITS_PAGE_SIZE, currentDevUnitsPage * DEV_UNITS_PAGE_SIZE);

  const agentSalesData = data?.salesByAgentData || [];
  const totalAgentPages = Math.max(1, Math.ceil(agentSalesData.length / AGENT_PAGE_SIZE));
  const paginatedAgentData = agentSalesData.slice((currentAgentPage - 1) * AGENT_PAGE_SIZE, currentAgentPage * AGENT_PAGE_SIZE);

  return (
    <div className="space-y-6">
      
      <Card>
        <CardHeader title="Filters" icon={<Filter size={18} style={{ color: TOKENS.primary }} />} 
          actions={
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1 max-w-[1000px]">
              <Select value={year} onChange={(e) => setYear(e.target.value)} className="w-auto min-w-[100px]">
                {[2025, 2024, 2023].map(y => <option key={y} value={y}>{y}</option>)}
              </Select>
              <Select value={quarter} onChange={(e) => setQuarter(e.target.value)} className="w-auto min-w-[120px]">
                <option value="All">All Quarters</option><option value="Q1">Q1</option><option value="Q2">Q2</option><option value="Q3">Q3</option><option value="Q4">Q4</option>
              </Select>
              <Select value={month} onChange={(e) => setMonth(e.target.value)} className="w-auto min-w-[120px]">
                <option value="All">All Months</option>
                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => <option key={m} value={m}>{m}</option>)}
              </Select>
              <Select value={selectedDeveloper} onChange={(e) => setSelectedDeveloper(e.target.value)} className="w-auto min-w-[150px]">
                <option value="All">All Developers</option>
                {(data?.allDevelopers || ALL_DEVELOPERS || []).map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
              <Select value={dealType} onChange={(e) => setDealType(e.target.value)} className="w-auto min-w-[140px]">
                <option value="All">All Deal Types</option><option value="Secondary">Secondary</option><option value="Off-plan">Off-plan</option>
              </Select>
            </div>
          }
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Total Deals" value={data.kpis.totalDeals} valueStyle="text-3xl" />
        <KPI label="Deals Won" value={data.kpis.dealsWon} valueStyle="text-3xl" />
        <KPI label="Gross Commission" value={formatCurrency(data.kpis.grossCommission)} valueStyle="text-xl" />
        <KPI label="Net Commission" value={formatCurrency(data.kpis.netCommission)} valueStyle="text-xl" />
      </div>

      <Card>
        <CardHeader title="Sales and Commission Analytics" />
        <CardBody>
          <div className="grid grid-cols-1 gap-4"><Table columns={wonDealsColumns} data={data.totalDealsByMonth} /></div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Sales by Property Type" />
        <CardBody>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={data?.salesByPropertyType || []} dataKey="value" nameKey="type" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                    {(data?.salesByPropertyType || []).map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" formatter={(value) => {
                        const item = data.salesByPropertyType.find(d => d.type === value);
                        return <span className="text-xs font-medium ml-2">{value} <span className="font-bold text-gray-900 ml-2">{item?.units}</span></span>;
                    }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div><Table columns={propertyTypeColumns} data={data?.salesByPropertyType || []} /></div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Developers vs Property Value" />
        <CardBody>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <div style={{ width: "100%", height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={paginatedDevelopers} dataKey="value" nameKey="developer" cx="35%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} labelLine={true} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                      {paginatedDevelopers.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ paddingLeft: "10px", fontSize: "12px", paddingTop: "6px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="lg:col-span-2">
              <Table columns={developersColumns} data={paginatedDevelopers} />
              <div className="flex items-center justify-between mt-3 text-sm" style={{ color: TOKENS.muted }}>
                <div>Showing {filteredDevelopersData.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filteredDevelopersData.length)} of {filteredDevelopersData.length}</div>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-2 border rounded">Prev</button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-2 border rounded">Next</button>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Transaction Breakdown Per Lead Source" />
        <CardBody>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div style={{ width: "100%", height: 450 }}>
              <ResponsiveContainer>
                <BarChart data={paginatedLeadData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide={false} tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val >= 1000 ? `${(val/1000).toFixed(0)}k` : val} tick={{ fontSize: 12, fill: TOKENS.muted }} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} interval={0} />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Legend verticalAlign="bottom" height={36} iconType="rect" />
                  <Bar dataKey="value" name="Volume (Deals)" radius={[0, 4, 4, 0]} barSize={30}>
                    {paginatedLeadData.map((entry, index) => <Cell key={`cell-${index}`} fill={index < MGMT_CHART_COLORS.length ? MGMT_CHART_COLORS[index] : TOKENS.primary} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-between">
              <Table columns={leadSourceHeaders} data={paginatedLeadData} />
              <div className="flex justify-between mt-4 text-sm">
                <div>Page {currentLeadPage} of {totalLeadPages}</div>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentLeadPage(p => Math.max(1, p - 1))} disabled={currentLeadPage === 1} className="px-2 border rounded">Prev</button>
                  <button onClick={() => setCurrentLeadPage(p => Math.min(totalLeadPages, p + 1))} disabled={currentLeadPage === totalLeadPages} className="px-2 border rounded">Next</button>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Developer vs Gross Comm" />
        <CardBody>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div style={{ width: "100%", height: 450 }}>
              <ResponsiveContainer>
                <BarChart data={paginatedDevCommData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide={false} tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val >= 1000 ? `${(val/1000).toFixed(0)}k` : val} tick={{ fontSize: 12, fill: TOKENS.muted }} />
                  <YAxis type="category" dataKey="developer" width={140} tick={{ fontSize: 12, fill: TOKENS.text }} interval={0} />
                  <Tooltip cursor={{ fill: "transparent" }} formatter={(val) => formatCurrency(val)} />
                  <Bar dataKey="value" name="Gross Comm" radius={[0, 4, 4, 0]} barSize={24}>
                    {paginatedDevCommData.map((entry, index) => <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#003366" : "#60a5fa"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-between">
              <Table columns={devCommColumns} data={paginatedDevCommData} />
              <div className="flex justify-between mt-4 text-sm">
                <div>Page {currentDevCommPage} of {totalDevCommPages}</div>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentDevCommPage(p => Math.max(1, p - 1))} disabled={currentDevCommPage === 1} className="px-2 border rounded">Prev</button>
                  <button onClick={() => setCurrentDevCommPage(p => Math.min(totalDevCommPages, p + 1))} disabled={currentDevCommPage === totalDevCommPages} className="px-2 border rounded">Next</button>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Developer vs Units" />
        <CardBody>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div style={{ width: "100%", height: 450 }}>
              <ResponsiveContainer>
                <BarChart data={paginatedDevUnitsData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide={false} tick={{ fontSize: 12, fill: TOKENS.muted }} />
                  <YAxis type="category" dataKey="developer" width={140} tick={{ fontSize: 12, fill: TOKENS.text }} interval={0} />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Bar dataKey="value" name="Units" radius={[0, 4, 4, 0]} barSize={24}>
                    {paginatedDevUnitsData.map((entry, index) => <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#003366" : "#60a5fa"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-between">
              <Table columns={devUnitsColumns} data={paginatedDevUnitsData} />
              <div className="flex justify-between mt-4 text-sm">
                <div>Page {currentDevUnitsPage} of {totalDevUnitsPages}</div>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentDevUnitsPage(p => Math.max(1, p - 1))} disabled={currentDevUnitsPage === 1} className="px-2 border rounded">Prev</button>
                  <button onClick={() => setCurrentDevUnitsPage(p => Math.min(totalDevUnitsPages, p + 1))} disabled={currentDevUnitsPage === totalDevUnitsPages} className="px-2 border rounded">Next</button>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* --- NEW: Sales by Agents --- */}
      <Card>
        <CardHeader title="Sales by Agents (by Deal Value)" />
        <CardBody>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div style={{ width: "100%", height: 450 }}>
              <ResponsiveContainer>
                <BarChart data={paginatedAgentData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis 
                    type="number" 
                    hide={false}
                    tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
                    tick={{ fontSize: 12, fill: TOKENS.muted }}
                  />
                  <YAxis type="category" dataKey="agent" width={140} tick={{ fontSize: 12, fill: TOKENS.text }} interval={0} />
                  <Tooltip cursor={{ fill: "transparent" }} formatter={(val) => formatCurrency(val)} />
                  <Bar dataKey="value" name="Deal Value" radius={[0, 4, 4, 0]} barSize={24}>
                    {paginatedAgentData.map((entry, index) => <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#003366" : "#60a5fa"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-between">
              <Table columns={agentColumns} data={paginatedAgentData} />
              <div className="flex justify-between mt-4 text-sm">
                <div>Page {currentAgentPage} of {totalAgentPages}</div>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentAgentPage(p => Math.max(1, p - 1))} disabled={currentAgentPage === 1} className="px-2 border rounded">Prev</button>
                  <button onClick={() => setCurrentAgentPage(p => Math.min(totalAgentPages, p + 1))} disabled={currentAgentPage === totalAgentPages} className="px-2 border rounded">Next</button>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

    </div>
  );
}