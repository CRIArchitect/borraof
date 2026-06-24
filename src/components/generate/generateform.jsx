import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, MessageSquareText, AudioLines, Users, Tag,
  AlertTriangle, Wand2,
} from "lucide-react";

import { Select, Textarea } from "../common/field";
import Button from "../common/button";
import ContentTypeGrid from "./contenttypegrid";
import { CONTENT_TYPES, BRIEF_SUGGESTIONS, contentType } from "../../util/constants";
import { stagger, item } from "../../lib/motion";

const MAX_BRIEF = 600;

/**
 * GenerateForm — coluna de configuração.
 * Props: { companies, onGenerate, loading }.
 * onGenerate({ company_id, type, brief, company }).
 */
export default function GenerateForm({ companies = [], onGenerate, loading }) {
  const [companyId, setCompanyId] = useState("");
  const [type, setType] = useState(CONTENT_TYPES[0].value);
  const [brief, setBrief] = useState("");

  const company = useMemo(
    () => companies.find((c) => String(c.id) === String(companyId)),
    [companies, companyId],
  );

  const typeLabel = contentType(type)?.label || "conteúdo";
  const canSubmit = Boolean(companyId) && brief.trim().length > 0 && !loading;
  const counterFull = brief.length >= MAX_BRIEF;

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    onGenerate({
      company_id: companyId,
      type,
      brief: brief.trim(),
      company,
    });
  }

  function applySuggestion(text) {
    setBrief((prev) => {
      const next = prev.trim() ? `${prev.trim()} ${text}` : text;
      return next.slice(0, MAX_BRIEF);
    });
  }

  return (
    <motion.form
      className="gen-form"
      onSubmit={handleSubmit}
      variants={stagger(0.07)}
      initial="hidden"
      animate="show"
    >
      {/* Empresa */}
      <motion.div variants={item}>
        <Select
          label="Empresa"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        >
          <option value="">Selecione uma empresa…</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        {/* Barra de contexto da empresa selecionada */}
        {company && (
          <div className="gen-context">
            {company.tone ? (
              <span className="gen-context-chip">
                <AudioLines aria-hidden /> Tom: <b>{company.tone}</b>
              </span>
            ) : (
              <span className="gen-context-chip gen-context-chip--warn">
                <AlertTriangle aria-hidden /> Tom não definido
              </span>
            )}
            {company.audience ? (
              <span className="gen-context-chip">
                <Users aria-hidden /> Público: <b>{company.audience}</b>
              </span>
            ) : (
              <span className="gen-context-chip gen-context-chip--warn">
                <AlertTriangle aria-hidden /> Público não definido
              </span>
            )}
            {company.segment ? (
              <span className="gen-context-chip">
                <Tag aria-hidden /> Segmento: <b>{company.segment}</b>
              </span>
            ) : (
              <span className="gen-context-chip gen-context-chip--warn">
                <AlertTriangle aria-hidden /> Segmento não definido
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* Tipo de conteúdo */}
      <motion.div variants={item}>
        <div className="gen-section-label">
          <Sparkles aria-hidden /> Tipo de conteúdo
        </div>
        <ContentTypeGrid value={type} onChange={setType} />
      </motion.div>

      {/* Briefing */}
      <motion.div variants={item}>
        <Textarea
          label="Briefing"
          rows={5}
          value={brief}
          maxLength={MAX_BRIEF}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Descreva o que você quer comunicar, a oferta, o objetivo…"
        />
        <div className="gen-brief-foot">
          <span className="gen-section-label" style={{ margin: 0 }}>
            <MessageSquareText aria-hidden /> Sugestões rápidas
          </span>
          <span className={`gen-counter ${counterFull ? "gen-counter--full" : ""}`}>
            {brief.length}/{MAX_BRIEF}
          </span>
        </div>

        <div className="gen-suggest">
          {BRIEF_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className="gen-suggest-chip"
              onClick={() => applySuggestion(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Ação */}
      <motion.div variants={item}>
        <Button
          type="submit"
          full
          size="lg"
          loading={loading}
          disabled={!canSubmit}
          icon={<Wand2 size={17} />}
        >
          Gerar {typeLabel}
        </Button>
      </motion.div>
    </motion.form>
  );
}
