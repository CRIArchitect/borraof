import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Download } from "lucide-react";
import GenerationFilters from "./generationfilters";
import GenerationCard from "./generationcard";
import Modal from "../common/modal";
import Button from "../common/button";
import EmptyState from "../common/emptystate";
import { stagger } from "../../lib/motion";
import { contentType } from "../../util/constants";
import { formatDateTime } from "../../util/formatdate";
import { useToast } from "../../context/toastcontext";

/**
 * GenerationList — orquestra filtros, lista (stagger) e modal de detalhe.
 * Filtra por busca (briefing + empresa), empresa (por company_name) e tipo.
 */
export default function GenerationList({ generations = [] }) {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [open, setOpen] = useState(null);

  // Empresas distintas presentes no acervo (para o select de filtro).
  const companies = useMemo(() => {
    const names = new Set();
    generations.forEach((g) => {
      if (g.company_name) names.add(g.company_name);
    });
    return Array.from(names)
      .sort((a, b) => a.localeCompare(b, "pt-BR"))
      .map((name) => ({ id: name, name }));
  }, [generations]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return generations.filter((g) => {
      if (typeFilter && g.type !== typeFilter) return false;
      if (companyFilter && g.company_name !== companyFilter) return false;
      if (q) {
        const hay = `${g.brief || ""} ${g.company_name || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [generations, query, companyFilter, typeFilter]);

  const hasFilters = Boolean(query.trim() || companyFilter || typeFilter);

  function handleCopy() {
    const text = open?.result || "";
    if (!text) {
      toast.error("Nada para copiar", "Esta geração não possui resultado.");
      return;
    }
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copiado", "Resultado na área de transferência."))
      .catch(() => toast.error("Falha ao copiar", "Seu navegador bloqueou a ação."));
  }

  function handleExport() {
    const text = open?.result || "";
    if (!text) {
      toast.error("Nada para exportar", "Esta geração não possui resultado.");
      return;
    }
    try {
      const type = contentType(open.type);
      const safe = (open.company_name || "geracao")
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "") || "geracao";
      const filename = `${safe}-${open.type || "conteudo"}.txt`;
      const header = `${open.company_name || ""} — ${type?.label || open.type || ""}\n${formatDateTime(open.created_at)}\n\n`;
      const blob = new Blob([header + text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Exportado", `Arquivo ${filename} gerado.`);
    } catch {
      toast.error("Falha ao exportar", "Não foi possível gerar o arquivo.");
    }
  }

  // Nenhuma geração no acervo.
  if (!generations.length) {
    return (
      <EmptyState
        symbol="∅"
        title="Nada por aqui ainda"
        subtitle="As gerações que você criar aparecerão neste acervo, prontas para revisar e reaproveitar."
      />
    );
  }

  const openType = open ? contentType(open.type) : null;
  const OpenIcon = openType?.icon;

  return (
    <>
      <GenerationFilters
        query={query}
        onQuery={setQuery}
        companyFilter={companyFilter}
        onCompany={setCompanyFilter}
        typeFilter={typeFilter}
        onType={setTypeFilter}
        companies={companies}
      />

      <motion.div
        className="hist-list"
        variants={stagger(0.06)}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <div className="hist-empty-inline" key="empty">
              <div className="hist-empty-symbol" aria-hidden>
                ∴
              </div>
              <p>
                {hasFilters
                  ? "Nenhuma geração corresponde aos filtros atuais."
                  : "Nenhuma geração encontrada."}
              </p>
            </div>
          ) : (
            filtered.map((g) => (
              <GenerationCard key={g.id} generation={g} onOpen={setOpen} />
            ))
          )}
        </AnimatePresence>
      </motion.div>

      <Modal
        open={Boolean(open)}
        onClose={() => setOpen(null)}
        title={open?.company_name || "Geração"}
        size="lg"
        actions={
          <>
            <Button variant="secondary" icon={<Download size={15} />} onClick={handleExport}>
              Exportar .txt
            </Button>
            <Button variant="primary" icon={<Copy size={15} />} onClick={handleCopy}>
              Copiar
            </Button>
          </>
        }
      >
        {open && (
          <div className="hist-detail">
            <div className="hist-detail-meta">
              <span className="hist-card-type">
                {OpenIcon && <OpenIcon size={12} aria-hidden />}
                {openType?.label || open.type || "Conteúdo"}
              </span>
              <span className="dot" aria-hidden />
              <span>{formatDateTime(open.created_at)}</span>
            </div>

            <div className="hist-detail-block">
              <span className="hist-detail-block-label">Briefing</span>
              <p className="hist-detail-brief">
                {(open.brief || "").trim() || "Sem briefing registrado."}
              </p>
            </div>

            <div className="hist-detail-block">
              <span className="hist-detail-block-label">Resultado</span>
              <div className="result-area" tabIndex={0} role="region" aria-label="Resultado da geração">
                {(open.result || "").trim() || "Esta geração não possui resultado salvo."}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
