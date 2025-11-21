import { TOKENS } from "../data";

export const Button = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const base =
    "px-3 py-2 rounded-xl text-sm font-medium transition focus:outline-none focus:ring-2";
  let styles = {};
  if (variant === "primary") {
    styles = { backgroundColor: TOKENS.primary, color: TOKENS.white };
  } else if (variant === "ghost") {
    styles = {
      borderColor: TOKENS.border,
      color: TOKENS.primary,
      backgroundColor: TOKENS.white,
    };
  } else if (variant === "danger") {
    // Explicit danger variant
    styles = { backgroundColor: TOKENS.redAccent, color: TOKENS.white };
  }
  return (
    <button
      className={`${base} ${variant === "ghost" ? "border" : ""} ${className}`}
      style={styles}
      {...props}
    >
      {children}
    </button>
  );
};