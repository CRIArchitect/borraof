import { motion } from "framer-motion";
import { Users, Building2, Sparkles, Clock } from "lucide-react";
import { stagger, item } from "../../lib/motion";
import AnimatedCounter from "../common/animatedcounter";

/**
 * AdminStats — four headline metrics with count-up animation.
 * props: { stats } -> { users, companies, generations, waitlist }
 */
const CARDS = [
  { key: "users", label: "Usuários", icon: Users },
  { key: "companies", label: "Empresas", icon: Building2 },
  { key: "generations", label: "Gerações", icon: Sparkles },
  { key: "waitlist", label: "Waitlist", icon: Clock },
];

export default function AdminStats({ stats }) {
  return (
    <motion.div
      className="admin-stats"
      variants={stagger(0.07)}
      initial="hidden"
      animate="show"
    >
      {CARDS.map(({ key, label, icon: Icon }) => {
        const value = Number(stats?.[key]) || 0;
        return (
          <motion.div key={key} className="admin-stat" variants={item}>
            <div className="admin-stat-head">
              <span className="admin-stat-icon" aria-hidden>
                <Icon size={16} />
              </span>
              <span className="admin-stat-label">{label}</span>
            </div>
            <div className="admin-stat-value">
              <AnimatedCounter value={value} />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
