import { TOKENS } from "../data";

export const Select = ({ children, className = "", ...props }) => (
  <select
    {...props}
    className={`w-full rounded-xl border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 ${className}`}
    style={{ borderColor: TOKENS.border, focusBorderColor: TOKENS.primary }}
  >
    {children}
  </select>
);