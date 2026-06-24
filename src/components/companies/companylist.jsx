import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { stagger, item } from "../../lib/motion";
import CompanyCard from "./companycard";
import EmptyState from "../common/emptystate";
import Button from "../common/button";

/**
 * CompanyList — responsive grid of brand cards with staggered
 * "desborrar" entrance. Shows an EmptyState when there are none.
 */
export default function CompanyList({ companies = [] }) {
  const navigate = useNavigate();

  if (!companies.length) {
    return (
      <EmptyState
        symbol="Δ"
        title="Nenhuma empresa ainda"
        subtitle="Cadastre sua primeira marca para começar a gerar conteúdo sob medida."
        action={
          <Button
            icon={<Plus />}
            onClick={() => navigate("/app/companies/new")}
          >
            Nova empresa
          </Button>
        }
      />
    );
  }

  return (
    <motion.div
      className="companies-grid"
      variants={stagger(0.06)}
      initial="hidden"
      animate="show"
    >
      {companies.map((company) => (
        <motion.div key={company.id} variants={item}>
          <CompanyCard company={company} />
        </motion.div>
      ))}
    </motion.div>
  );
}
