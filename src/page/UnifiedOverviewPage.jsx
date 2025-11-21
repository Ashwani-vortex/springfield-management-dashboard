import { useState, useEffect } from "react";
import { Search } from "lucide-react";
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
import { TOKENS, CHART_COLORS } from "../utils/data";
import { Card } from "../utils/ui/Card";
import { CardHeader } from "../utils/ui/CardHeader";
import { CardBody } from "../utils/ui/CardBody";
import { LoadingSpinner } from "../utils/ui/loading-spinner";
import { Table } from "../utils/ui/table";
import { useManagementData } from "../hooks/useOverviewData";
import KPI from "../utils/ui/KPI.JSX";
import { Select } from "../utils/ui/Select";

// Helper to format numbers into currency
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
  const [currentDevCommPage, setCurrentDevCommPage] = useState(1);
  const DEV_COMM_PAGE_SIZE = 8;
  const PAGE_SIZE = 10;
  const LEAD_PAGE_SIZE = 9;
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLeadPage, setCurrentLeadPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [year, selectedDeveloper]);

  const { data, isLoading, isError, error } = useManagementData(year);
  console.log("data", data);

  const wonDealsColumns = [
    { header: "Month", key: "month" },
    { header: "Deals Won", key: "dealsWon" },
    { header: "Property Price", key: "propertyPrice", render: formatCurrency },
    {
      header: "Gross Commission",
      key: "grossCommission",
      render: formatCurrency,
    },
    { header: "Net Commission", key: "netCommission", render: formatCurrency },
    {
      header: "Payment Received",
      key: "paymentReceived",
      render: formatCurrency,
    },
    {
      header: "Amount Receivable",
      key: "amountReceivable",
      render: formatCurrency,
    },
  ];

  const developersColumns = [
    { header: "Developer", key: "developer" },
    { header: "Total Property Value", key: "value", render: formatCurrency },
    {
      header: "Total Property Percentage",
      key: "percentage",
      render: (val) => `${val}%`,
    },
  ];

  const leadSourceHeaders = [
    {
      header: "Lead Source",
      key: "name",
      render: (name, row, index) => (
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor:
                index < MGMT_CHART_COLORS.length
                  ? MGMT_CHART_COLORS[index]
                  : TOKENS.primary,
            }}
          />
          {name}
        </div>
      ),
    },
    { header: "Value (AED)", key: "value", render: formatCurrency },
  ];
  // --- FIX END ---
  const propertyTypeColumns = [
    { header: "Type", key: "type" },
    { header: "Units", key: "units" },
    { header: "Value (AED)", key: "value", render: formatCurrency },
  ];

  const MGMT_CHART_COLORS = ["#003366", "#3b82f6", "#60a5fa"];


 const devCommColumns = [
    { header: "Developer", key: "developer" },
    { header: "Gross Comm (AED)", key: "value", render: formatCurrency },
  ];

  const devCommData = data?.developerCommissionData || [];
  const totalDevCommPages = Math.max(1, Math.ceil(devCommData.length / DEV_COMM_PAGE_SIZE));
  const paginatedDevCommData = devCommData.slice(
    (currentDevCommPage - 1) * DEV_COMM_PAGE_SIZE,
    currentDevCommPage * DEV_COMM_PAGE_SIZE
  );

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-8 text-red-500">
        Error loading data: {error.message}
      </div>
    );
  }

  // Apply developer filter first
  const filteredDevelopersData = data.developersData.filter(
    (dev) => selectedDeveloper === "All" || dev.developer === selectedDeveloper
  );

  // Pagination calculations
  const totalPages = Math.max(
    1,
    Math.ceil(filteredDevelopersData.length / PAGE_SIZE)
  );
  const paginatedDevelopers = filteredDevelopersData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const leadData = data?.leadSourceData || [];
  const totalLeadPages = Math.max(
    1,
    Math.ceil(leadData.length / LEAD_PAGE_SIZE)
  );
  const paginatedLeadData = leadData.slice(
    (currentLeadPage - 1) * LEAD_PAGE_SIZE,
    currentLeadPage * LEAD_PAGE_SIZE
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <label
            htmlFor="financial-year"
            className="text-lg font-bold"
            style={{ color: TOKENS.text }}
          >
            Financial Year:
          </label>
          <Select
            id="financial-year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-32"
          >
            <option>2025</option>
            <option>2024</option>
            <option>2023</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI
          label="Total Deals"
          value={data.kpis.totalDeals}
          valueStyle="text-3xl"
        />
        <KPI
          label="Deals Won"
          value={data.kpis.dealsWon}
          valueStyle="text-3xl"
        />
        <KPI
          label="Gross Commission"
          value={formatCurrency(data.kpis.grossCommission)}
          valueStyle="text-xl"
        />
        <KPI
          label="Net Commission"
          value={formatCurrency(data.kpis.netCommission)}
          valueStyle="text-xl"
        />
      </div>

      <Card>
        <CardHeader title="Sales and Commission Analytics" />
        <CardBody>
          <div className="grid grid-cols-1  gap-4">
            <Table columns={wonDealsColumns} data={data.totalDealsByMonth} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Developers vs Property Value"
          actions={
            <div className="flex items-center gap-2">
              {/* <Select
                className="w-48"
                value={selectedDeveloper}
                onChange={(e) => setSelectedDeveloper(e.target.value)}
              >
                <option value="All">All Developers</option>
                {data.allDevelopers.map((dev) => (
                  <option key={dev} value={dev}>
                    {dev}
                  </option>
                ))}
              </Select> */}
            </div>
          }
        />
        <CardBody>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <div style={{ width: "100%", height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={paginatedDevelopers}
                      dataKey="value"
                      nameKey="developer"
                      cx="35%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      labelLine={true}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {paginatedDevelopers.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>

                    {/* Formats the Tooltip values as currency */}
                    <Tooltip formatter={(value) => formatCurrency(value)} />

                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      wrapperStyle={{
                        paddingLeft: "10px",
                        fontSize: "12px",
                        paddingTop: "6px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="lg:col-span-2">
              {/* --- FIX: Use 'columns' prop and pass raw data --- */}
              <Table columns={developersColumns} data={paginatedDevelopers} />
              {/* Pagination controls */}
              <div className="flex items-center justify-between mt-3">
                <div className="text-sm" style={{ color: TOKENS.muted }}>
                  Showing{" "}
                  {filteredDevelopersData.length === 0
                    ? 0
                    : (currentPage - 1) * PAGE_SIZE + 1}{" "}
                  -
                  {Math.min(
                    currentPage * PAGE_SIZE,
                    filteredDevelopersData.length
                  )}{" "}
                  of {filteredDevelopersData.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded"
                    style={{
                      border: `1px solid ${TOKENS.border}`,
                      background: "transparent",
                    }}
                  >
                    Prev
                  </button>

                  <div
                    className="px-3 py-1 text-sm"
                    style={{ color: TOKENS.text }}
                  >
                    {currentPage} / {totalPages}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded"
                    style={{
                      border: `1px solid ${TOKENS.border}`,
                      background: "transparent",
                    }}
                  >
                    Next
                  </button>
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
            {/* Left: Bar Chart */}
            <div style={{ width: "100%", height: 450 }}>
              <ResponsiveContainer>
                <BarChart
                  // --- FIX: Change 'leadData' to 'paginatedLeadData' to sync with table ---
                  data={paginatedLeadData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={140}
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                    {paginatedLeadData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        // Optional: If you want colors to persist across pages, use the global index
                        // Otherwise, this resets colors on every page (which looks cleaner usually)
                        fill={
                          index < MGMT_CHART_COLORS.length
                            ? MGMT_CHART_COLORS[index]
                            : TOKENS.primary
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Right: Table with Pagination */}
            <div className="flex flex-col justify-between">
              <div>
                <Table columns={leadSourceHeaders} data={paginatedLeadData} />
              </div>

              <div
                className="flex items-center justify-between mt-4 border-t pt-4"
                style={{ borderColor: TOKENS.border }}
              >
                <div className="text-sm" style={{ color: TOKENS.muted }}>
                  Page {currentLeadPage} of {totalLeadPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentLeadPage((p) => Math.max(1, p - 1))
                    }
                    disabled={currentLeadPage === 1}
                    className="px-3 py-1 rounded text-xs transition-colors hover:bg-gray-100"
                    style={{ border: `1px solid ${TOKENS.border}` }}
                  >
                    Prev
                  </button>
                  <button
                    onClick={() =>
                      setCurrentLeadPage((p) => Math.min(totalLeadPages, p + 1))
                    }
                    disabled={currentLeadPage === totalLeadPages}
                    className="px-3 py-1 rounded text-xs transition-colors hover:bg-gray-100"
                    style={{ border: `1px solid ${TOKENS.border}` }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
      <Card>
  <CardHeader title="Sales by Property Type" />
  <CardBody>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
      
      {/* Donut Chart */}
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data?.salesByPropertyType || []}
              dataKey="value"
              nameKey="type"
              cx="50%"
              cy="50%"
              innerRadius={60} // Donut style
              outerRadius={80}
              paddingAngle={5}
            >
              {(data?.salesByPropertyType || []).map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={CHART_COLORS[index % CHART_COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value)} />
            {/* Custom Legend to match your image: "Type  Units" */}
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              formatter={(value, entry) => {
                  const item = data.salesByPropertyType.find(d => d.type === value);
                  return <span className="text-xs font-medium ml-2">{value} <span className="font-bold text-gray-900 ml-2">{item?.units}</span></span>;
              }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div>
        <Table 
          columns={propertyTypeColumns} 
          data={data?.salesByPropertyType || []} 
        />
      </div>

    </div>
  </CardBody>
</Card>

<Card>
        <CardHeader title="Developer vs Gross Comm" />
        <CardBody>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left: Bar Chart */}
            <div style={{ width: "100%", height: 450 }}>
              <ResponsiveContainer>
                <BarChart
                  data={paginatedDevCommData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis 
                    type="number" 
                    hide={false}
                    tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
                    tick={{ fontSize: 12, fill: TOKENS.muted }}
                  />
                  <YAxis
                    type="category"
                    dataKey="developer"
                    width={140}
                    tick={{ fontSize: 12, fill: TOKENS.text }}
                    interval={0}
                  />
                  <Tooltip cursor={{ fill: "transparent" }} formatter={(val) => formatCurrency(val)} />
                  <Bar 
                    dataKey="value" 
                    name="Gross Comm"
                    radius={[0, 4, 4, 0]} 
                    barSize={24}
                  >
                    {paginatedDevCommData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        // Alternate colors: Dark Blue, Light Blue
                        fill={index % 2 === 0 ? "#003366" : "#60a5fa"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Right: Table with Pagination */}
            <div className="flex flex-col justify-between">
              <div>
                <Table columns={devCommColumns} data={paginatedDevCommData} />
              </div>

              <div
                className="flex items-center justify-between mt-4 border-t pt-4"
                style={{ borderColor: TOKENS.border }}
              >
                <button
                  onClick={() => setCurrentDevCommPage((p) => Math.max(1, p - 1))}
                  disabled={currentDevCommPage === 1}
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-50"
                  style={{
                    border: `1px solid ${TOKENS.border}`,
                    color: currentDevCommPage === 1 ? TOKENS.muted : TOKENS.text,
                    opacity: currentDevCommPage === 1 ? 0.5 : 1,
                    cursor: currentDevCommPage === 1 ? "not-allowed" : "pointer"
                  }}
                >
                  &lt; Previous
                </button>

                <span className="text-sm" style={{ color: TOKENS.muted }}>
                  Page {currentDevCommPage} of {totalDevCommPages}
                </span>

                <button
                  onClick={() => setCurrentDevCommPage((p) => Math.min(totalDevCommPages, p + 1))}
                  disabled={currentDevCommPage === totalDevCommPages}
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-50"
                  style={{
                    border: `1px solid ${TOKENS.border}`,
                    color: currentDevCommPage === totalDevCommPages ? TOKENS.muted : TOKENS.text,
                    opacity: currentDevCommPage === totalDevCommPages ? 0.5 : 1,
                    cursor: currentDevCommPage === totalDevCommPages ? "not-allowed" : "pointer"
                  }}
                >
                  Next &gt;
                </button>
              </div>
            </div>

          </div>
        </CardBody>
      </Card>
    </div>
  );
}
