import { motion } from "framer-motion";
import { cn } from "../../util/cn";

/**
 * Button — motion-enhanced. variant: primary|secondary|ghost|danger.
 * Props: size (sm|lg), full, loading, icon (ReactNode), ...native button props.
 */
export default function Button({
  children,
  variant = "primary",
  size = "",
  full = false,
  loading = false,
  icon = null,
  className = "",
  disabled,
  ...props
}) {
  const inert = disabled || loading;
  return (
    <motion.button
      whileHover={!inert ? { y: -1 } : undefined}
      whileTap={!inert ? { scale: 0.97 } : undefined}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn("btn", `btn-${variant}`, size && `btn-${size}`, full && "btn-full", className)}
      disabled={inert}
      {...props}
    >
      {loading ? <span className="spinner" aria-hidden /> : icon}
      {children}
    </motion.button>
  );
}
