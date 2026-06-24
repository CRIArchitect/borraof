import { motion } from "framer-motion";
import { blurIn } from "../../lib/motion";

/**
 * Reveal — the signature "desborrar" entrance (blur → focus).
 * Use as a drop-in motion wrapper. `delay` staggers manual sequences.
 */
export default function Reveal({ children, delay = 0, className = "", as = "div", ...props }) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      initial="hidden"
      animate="show"
      variants={blurIn}
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </Comp>
  );
}
