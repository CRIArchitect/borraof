import { motion } from "framer-motion";
import { ease } from "../../lib/motion";

/**
 * AdminTabs — animated segmented control.
 * props: { tabs: [{ id, label, icon: LucideComponent }], active, onChange }
 * The active pill slides via shared layoutId.
 */
export default function AdminTabs({ tabs = [], active, onChange }) {
  return (
    <div className="admin-tabs" role="tablist" aria-label="Seções do admin">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`admin-tab${isActive ? " active" : ""}`}
            onClick={() => onChange(tab.id)}
          >
            {isActive && (
              <motion.span
                layoutId="admin-tab-pill"
                className="admin-tab-pill"
                transition={ease.spring}
                aria-hidden
              />
            )}
            {Icon && (
              <span className="admin-tab-icon" aria-hidden>
                <Icon size={15} />
              </span>
            )}
            <span className="admin-tab-label">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
