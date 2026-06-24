import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { hoverLift } from "../../lib/motion";
import { COLOR_PALETTE } from "../../util/constants";

/**
 * CompanyCard — a single brand card.
 * Accent (border highlight, dot glow, CTA) follows company.color.
 * Renders as a Link to the edit route. Fully keyboard accessible.
 */
export default function CompanyCard({ company }) {
  const brand = company?.color || COLOR_PALETTE[0];
  const meta = [company?.tone, company?.city].filter(Boolean);

  return (
    <motion.div
      variants={hoverLift}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
    >
      <Link
        to={"/app/companies/" + company.id + "/edit"}
        className="company-card"
        style={{ "--brand": brand }}
        aria-label={`Editar empresa ${company.name}`}
      >
        <div className="company-card-head">
          <span className="company-dot" aria-hidden />
          <span className="company-card-name">{company.name}</span>
        </div>

        {company.segment && (
          <p className="company-card-segment">{company.segment}</p>
        )}

        <div className="company-card-meta">
          {meta.length > 0 ? (
            meta.map((m, i) => (
              <span key={i} className="flex items-center gap-8">
                {i > 0 && <span className="dot-sep" aria-hidden>·</span>}
                {m}
              </span>
            ))
          ) : (
            <span>Marca sem detalhes ainda</span>
          )}
        </div>

        <span className="company-card-cta">
          Editar marca <ArrowUpRight aria-hidden />
        </span>
      </Link>
    </motion.div>
  );
}
