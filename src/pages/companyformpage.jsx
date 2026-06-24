import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { pageTransition } from "../lib/motion";
import PageHeader from "../components/layout/pageheader";
import LoadingState from "../components/common/loadingstate";
import CompanyForm from "../components/companies/companyform";
import { companyService } from "../services/companyservice";
import { errMsg } from "../services/api";
import { useToast } from "../context/toastcontext";

/**
 * CompanyFormPage — hosts the create/edit brand form.
 * On edit, fetches the company by :id; on error toasts and returns.
 */
export default function CompanyFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const isEdit = Boolean(id);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    let active = true;

    (async () => {
      setLoading(true);
      try {
        const data = await companyService.get(id);
        if (active) setCompany(data);
      } catch (err) {
        if (active) {
          toast.error("Empresa não encontrada", errMsg(err));
          navigate("/app");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id, isEdit, navigate, toast]);

  if (loading) {
    return <LoadingState message="Carregando empresa…" />;
  }

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="show" exit="exit">
      <PageHeader
        eyebrow="Empresa"
        title={isEdit ? "Editar empresa" : "Nova empresa"}
        subtitle={
          isEdit
            ? company?.name || "Ajuste os detalhes da marca."
            : "Defina a marca para gerar conteúdo no tom certo."
        }
      />
      <CompanyForm initial={company || undefined} companyId={isEdit ? id : undefined} />
    </motion.div>
  );
}
