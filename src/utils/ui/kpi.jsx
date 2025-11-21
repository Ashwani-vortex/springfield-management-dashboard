import { Card } from "./Card";
import { CardBody } from "./CardBody";
import {TOKENS} from "../data";

function KPI({ label, value, delta, valueStyle = "text-2xl" }) {
  return (
    <Card>
      <CardBody>
        <div className="text-xs" style={{ color: TOKENS.muted }}>
          {label}
        </div>
        <div
          className={`${valueStyle} font-semibold`}
          style={{ color: TOKENS.text }}
        >
          {value}
        </div>
        {typeof delta === "number" && (
          <div
            className="text-xs mt-1"
            style={{ color: delta >= 0 ? TOKENS.primary : TOKENS.redAccent }}
          >
            {delta >= 0 ? "+" : ""}
            {delta}% vs last month
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default KPI;