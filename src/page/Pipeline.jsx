import { Target, BellRing } from "lucide-react";
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

import { useStatusData } from "../hooks/useStatusData";
import { TOKENS,CHART_COLORS } from "../utils/data";
import { Card } from "../utils/ui/Card";
import { CardHeader } from "../utils/ui/CardHeader";
import { CardBody } from "../utils/ui/CardBody";
import { Button } from "../utils/ui/Button";
import {LoadingSpinner } from "../utils/ui/loading-spinner";

export function Pipeline() {
  const currentYear = new Date().getFullYear();
  const { data, isLoading, isError, error } = useStatusData(currentYear);

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
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <Card className="xl:col-span-2">
        <CardHeader
          title="Pipeline Health"
          icon={<Target size={18} style={{ color: TOKENS.primary }} />}
        />
        <CardBody>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={data?.pipelineHealthData}>
                <CartesianGrid strokeDasharray="3 3" stroke={TOKENS.border} />
                <XAxis
                  dataKey="stage"
                  stroke={TOKENS.muted}
                  angle={-15}
                  textAnchor="end"
                  height={50}
                />
                <YAxis stroke={TOKENS.muted} />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill={TOKENS.primary}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Missed Leads (Alert)"
          icon={<BellRing size={18} style={{ color: TOKENS.redAccent }} />}
        />
        <CardBody>
          <ul className="text-sm space-y-2">
            {data?.missedLeads.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between p-2 rounded-xl border"
                style={{ borderColor: TOKENS.border }}
              >
                <span style={{ color: TOKENS.text }}>
                  {`L-${m.id}`} • {m.source}
                </span>
                <span style={{ color: TOKENS.muted }}>
                  {m.agent} • {m.age}
                </span>
              </li>
            ))}
            {data?.missedLeads.length === 0 && (
              <p className="text-sm text-center text-gray-500">
                No missed leads over 24h. Great job!
              </p>
            )}
          </ul>
          <Button variant="ghost" className="mt-3">
            Create Follow‑up Tasks
          </Button>
        </CardBody>
      </Card>

      <Card className="xl:col-span-3">
        <CardHeader
          title="Lead Source Effectiveness"
          icon={<Target size={18} style={{ color: TOKENS.primary }} />}
        />
        <CardBody>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data?.leadSourceData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  innerRadius={45}
                >
                  {data?.leadSourceData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

