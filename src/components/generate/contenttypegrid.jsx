import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { CONTENT_TYPES } from "../../util/constants";
import { stagger, item, ease } from "../../lib/motion";
import { cn } from "../../util/cn";

/**
 * ContentTypeGrid — grade de cards de tipo de conteúdo.
 * Props: { value, onChange }. Cada card é um <button> acessível;
 * o selecionado ganha realce "fogo" + check animado.
 */
export default function ContentTypeGrid({ value, onChange }) {
  return (
    <motion.div
      className="ctype-grid"
      variants={stagger(0.05)}
      initial="hidden"
      animate="show"
      role="radiogroup"
      aria-label="Tipo de conteúdo"
    >
      {CONTENT_TYPES.map((t) => {
        const Icon = t.icon;
        const selected = value === t.value;
        return (
          <motion.button
            key={t.value}
            type="button"
            variants={item}
            role="radio"
            aria-checked={selected}
            aria-label={t.label}
            onClick={() => onChange(t.value)}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            transition={ease.springSnappy}
            className={cn("ctype-card", selected && "is-selected")}
          >
            {selected && (
              <motion.span
                className="ctype-check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={ease.spring}
                aria-hidden
              >
                <Check strokeWidth={3} />
              </motion.span>
            )}
            <span className="ctype-card-ico" aria-hidden>
              <Icon strokeWidth={1.75} />
            </span>
            <span className="ctype-card-label">{t.label}</span>
            <span className="ctype-card-desc">{t.desc}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
