import { TOKENS } from "../data";
export const Input = (props) => (
  <input
    {...props}
    className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-1`}
    style={{ borderColor: TOKENS.border, focusBorderColor: TOKENS.primary }}
  />
);