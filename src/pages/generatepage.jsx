import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

import PageHeader from "../components/layout/pageheader";
import Button from "../components/common/button";
import EmptyState from "../components/common/emptystate";
import LoadingState from "../components/common/loadingstate";
import GenerateForm from "../components/generate/generateform";
import ResultPreview from "../components/generate/resultpreview";

import { useCompanies } from "../hooks/usecompanies";
import { useToast } from "../context/toastcontext";
import { generationService } from "../services/generationservice";
import { errMsg } from "../services/api";
import { item, stagger } from "../lib/motion";

export default function GeneratePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { companies, loading: loadingCompanies, error: companiesError, reload } =
    useCompanies();

  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [lastPayload, setLastPayload] = useState(null);
  const [activeCompany, setActiveCompany] = useState(null);

  async function runGenerate(payload, company) {
    setGenerating(true);
    setError("");
    try {
      const data = await generationService.generate({
        company_id: payload.company_id,
        type: payload.type,
        brief: payload.brief,
      });
      const text = data.result || data.content || "";
      if (!text) {
        const msg = "A IA retornou um resultado vazio. Tente refinar o briefing.";
        setError(msg);
        toast.error("Resultado vazio", msg);
        return;
      }
      setResult(text);
      toast.success("Conteúdo gerado", "Seu conteúdo está pronto.");
    } catch (err) {
      const msg = errMsg(err, "Não foi possível gerar o conteúdo agora.");
      setError(msg); // NÃO joga erro no result
      setResult("");
      toast.error("Falha ao gerar", msg);
    } finally {
      setGenerating(false);
    }
  }

  function handleGenerate({ company_id, type, brief, company }) {
    const payload = { company_id, type, brief };
    setLastPayload(payload);
    setActiveCompany(company || null);
    setResult("");
    runGenerate(payload, company);
  }

  function handleRegenerate() {
    if (!lastPayload) return;
    setResult("");
    runGenerate(lastPayload, activeCompany);
  }

  function handleClear() {
    setResult("");
    setError("");
  }

  // Carregando empresas
  if (loadingCompanies) {
    return <LoadingState message="Carregando suas empresas…" />;
  }

  // Erro ao carregar empresas (distinto de vazio)
  if (companiesError) {
    return (
      <div className="page">
        <PageHeader eyebrow="IA" title="Gerar conteúdo" />
        <div className="alert alert-error" role="alert" style={{ marginTop: 16 }}>
          <span>{companiesError || "Não foi possível carregar suas empresas."}</span>
        </div>
        <div className="mt-16">
          <Button variant="secondary" onClick={reload}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  // Sem empresas cadastradas
  if (!companies.length) {
    return (
      <div className="page">
        <PageHeader eyebrow="IA" title="Gerar conteúdo" />
        <EmptyState
          symbol="Δ"
          title="Cadastre uma empresa antes de gerar"
          subtitle="O conteúdo é moldado pela identidade da marca. Crie sua primeira empresa para começar a desborrar ideias."
          action={
            <Button
              icon={<Building2 size={16} />}
              onClick={() => navigate("/app/companies/new")}
            >
              Cadastrar empresa
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="IA"
        title="Gerar conteúdo"
        subtitle="Da névoa ao foco — descreva o briefing e deixe a IA desborrar o conteúdo da sua marca."
      />

      <motion.div
        className="gen-grid"
        variants={stagger(0.1)}
        initial="hidden"
        animate="show"
      >
        <motion.section
          className="panel card-pad edge-glow gen-panel"
          variants={item}
          aria-label="Configuração"
        >
          <div className="panel-title">Configuração</div>
          <GenerateForm
            companies={companies}
            onGenerate={handleGenerate}
            loading={generating}
          />
        </motion.section>

        <motion.section
          className="panel card-pad gen-panel gen-panel--result"
          variants={item}
          aria-label="Resultado"
          aria-live="polite"
        >
          <div className="panel-title">Resultado</div>
          <ResultPreview
            result={result}
            loading={generating}
            error={error}
            companyName={activeCompany?.name}
            onRegenerate={handleRegenerate}
            onClear={handleClear}
          />
        </motion.section>
      </motion.div>
    </div>
  );
}
