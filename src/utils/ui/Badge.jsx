import { TOKENS } from "../data";

export const Badge = ({ children, type = "primary" }) => {
  let style = {};
  if (type === "primary") {
    style = { backgroundColor: TOKENS.primarySoft, color: TOKENS.primary };
  } else if (type === "danger") {
    style = { backgroundColor: TOKENS.redAccent, color: TOKENS.white };
  }
  return (
    <span className="px-2 py-1 text-xs rounded-full" style={style}>
      {children}
    </span>
  );
};