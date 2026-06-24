import { motion } from "framer-motion";
import { cn } from "../../util/cn";

/** Round/square icon-only button with accessible label + tooltip. */
export default function IconButton({ label, children, tip = true, className = "", ...props }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      aria-label={label}
      data-tip={tip ? label : undefined}
      className={cn("icon-btn", tip && "tip", className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}
