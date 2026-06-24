import { motion } from "framer-motion";
import { item, stagger } from "../../lib/motion";

/** Page header with eyebrow, animated title and optional actions. */
export default function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <motion.div className="page-header" variants={stagger(0.05)} initial="hidden" animate="show">
      <div>
        {eyebrow && <motion.div variants={item} className="eyebrow mb-12">{eyebrow}</motion.div>}
        <motion.h1 variants={item} className="page-header-title">{title}</motion.h1>
        {subtitle && <motion.p variants={item} className="page-header-sub">{subtitle}</motion.p>}
      </div>
      {actions && <motion.div variants={item} className="page-header-actions">{actions}</motion.div>}
    </motion.div>
  );
}
