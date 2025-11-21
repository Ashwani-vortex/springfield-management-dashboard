import { TOKENS } from "../data";

export const CardHeader = ({ title, icon, subtitle, actions }) => (
  <div
    className="p-4 border-b flex items-center justify-between gap-4"
    style={{ borderColor: TOKENS.border }}
  >
    <div className="flex items-start gap-3 shrink-0">
      {" "}
      {/* Add shrink-0 to title part */}
      {icon}
      <div>
        <h3 className="text-lg font-semibold" style={{ color: TOKENS.text }}>
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs" style={{ color: TOKENS.muted }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {/* Wrap actions in a min-w-0 div to allow it to shrink and enable overflow */}
    <div className="min-w-0">{actions}</div>
  </div>
);