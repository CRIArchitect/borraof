import { motion } from "framer-motion";
import { Clock, ArrowUpRight } from "lucide-react";
import { item, ease } from "../../lib/motion";
import { contentType } from "../../util/constants";
import { formatRelative } from "../../util/formatdate";

/**
 * GenerationCard — cartão clicável de uma geração.
 * Mostra empresa, tipo (ícone+label), tempo relativo e briefing truncado.
 * hoverLift + entrada via stagger `item`. Aciona onOpen(generation).
 */
export default function GenerationCard({ generation, onOpen }) {
  const type = contentType(generation.type);
  const Icon = type?.icon;
  const label = type?.label || generation.type || "Conteúdo";
  const brief = (generation.brief || "").trim() || "Sem briefing registrado.";

  return (
    <motion.button
      type="button"
      className="hist-card"
      variants={item}
      whileHover={{ y: -4, transition: ease.springSnappy }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onOpen(generation)}
      aria-label={`Abrir geração de ${generation.company_name || "empresa"} — ${label}`}
    >
      <div className="hist-card-top">
        <span className="hist-card-company">
          {generation.company_name || "Sem empresa"}
        </span>
        <span className="hist-card-type">
          {Icon && <Icon size={12} aria-hidden />}
          {label}
        </span>
      </div>

      <p className="hist-card-brief">{brief}</p>

      <div className="hist-card-foot">
        <span className="hist-card-time">
          <Clock size={12} aria-hidden />
          {formatRelative(generation.created_at)}
        </span>
        <span className="hist-card-arrow" aria-hidden>
          <ArrowUpRight size={16} />
        </span>
      </div>
    </motion.button>
  );
}
