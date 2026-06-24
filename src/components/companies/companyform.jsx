import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Save, Trash2 } from "lucide-react";
import { Input, Textarea } from "../common/field";
import Button from "../common/button";
import BrandPreview from "./brandpreview";
import { item, stagger } from "../../lib/motion";
import { COLOR_PALETTE, TONES } from "../../util/constants";
import { companyService } from "../../services/companyservice";
import { errMsg } from "../../services/api";
import { useCompanies } from "../../hooks/usecompanies";
import { useToast } from "../../context/toastcontext";
import { useConfirm } from "../../context/confirmcontext";

const EMPTY = {
  name: "",
  segment: "",
  audience: "",
  city: "",
  tone: "",
  extra: "",
  color: COLOR_PALETTE[0],
};

/**
 * CompanyForm — create / edit a brand.
 * Two columns: editable form on the left, live BrandPreview on the
 * right (collapses to one column on narrow screens).
 */
export default function CompanyForm({ initial, companyId }) {
  const navigate = useNavigate();
  const { upsert, removeLocal } = useCompanies();
  const toast = useToast();
  const confirm = useConfirm();

  const isEdit = Boolean(companyId);
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const set = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const toggleTone = (tone) =>
    setForm((f) => ({ ...f, tone: f.tone === tone ? "" : tone }));

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Informe o nome da empresa.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      segment: form.segment.trim(),
      audience: form.audience.trim(),
      city: form.city.trim(),
      tone: form.tone,
      extra: form.extra.trim(),
      color: form.color,
    };

    setSaving(true);
    try {
      const result = isEdit
        ? await companyService.update(companyId, payload)
        : await companyService.create(payload);
      upsert(result);
      toast.success(
        isEdit ? "Empresa atualizada" : "Empresa criada",
        `${payload.name} está pronta para gerar conteúdo.`
      );
      navigate("/app");
    } catch (err) {
      toast.error("Não foi possível salvar", errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    const ok = await confirm({
      title: "Remover empresa",
      message: `Tem certeza que deseja remover "${form.name || "esta empresa"}"? Esta ação não pode ser desfeita.`,
      confirmLabel: "Remover",
      cancelLabel: "Cancelar",
      danger: true,
    });
    if (!ok) return;

    setRemoving(true);
    try {
      await companyService.remove(companyId);
      removeLocal(companyId);
      toast.success("Empresa removida", `${form.name || "A empresa"} foi excluída.`);
      navigate("/app");
    } catch (err) {
      toast.error("Não foi possível remover", errMsg(err));
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="company-form-layout">
      <motion.form
        className="company-form"
        onSubmit={handleSubmit}
        variants={stagger(0.05)}
        initial="hidden"
        animate="show"
        noValidate
      >
        <motion.div variants={item}>
          <Input
            label="Nome da empresa *"
            value={form.name}
            onChange={set("name")}
            placeholder="Ex.: Studio Aurora"
            autoComplete="off"
            aria-invalid={errors.name ? "true" : undefined}
          />
          {errors.name && (
            <span className="text-xs" style={{ color: "var(--coral)" }} role="alert">
              {errors.name}
            </span>
          )}
        </motion.div>

        <motion.div variants={item} className="company-form-grid">
          <Input
            label="Segmento"
            value={form.segment}
            onChange={set("segment")}
            placeholder="Ex.: Moda autoral"
            autoComplete="off"
          />
          <Input
            label="Cidade"
            value={form.city}
            onChange={set("city")}
            placeholder="Ex.: São Paulo"
            autoComplete="off"
          />
        </motion.div>

        <motion.div variants={item}>
          <Input
            label="Público-alvo"
            value={form.audience}
            onChange={set("audience")}
            placeholder="Ex.: Mulheres de 25 a 40, criativas"
            autoComplete="off"
          />
        </motion.div>

        <motion.div variants={item} className="field">
          <span className="field-label" id="tone-label">Tom de voz</span>
          <div className="tone-chips" role="group" aria-labelledby="tone-label">
            {TONES.map((tone) => {
              const selected = form.tone === tone;
              return (
                <button
                  key={tone}
                  type="button"
                  className={"chip" + (selected ? " selected" : "")}
                  aria-pressed={selected}
                  onClick={() => toggleTone(tone)}
                >
                  {tone}
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div variants={item} className="field">
          <span className="field-label" id="color-label">Cor da marca</span>
          <div className="color-swatches" role="group" aria-labelledby="color-label">
            {COLOR_PALETTE.map((hex) => {
              const selected = form.color === hex;
              return (
                <button
                  key={hex}
                  type="button"
                  className={"color-swatch" + (selected ? " selected" : "")}
                  style={{ "--sw": hex }}
                  aria-label={`Cor ${hex}`}
                  aria-pressed={selected}
                  onClick={() => set("color")(hex)}
                >
                  {selected && <Check aria-hidden strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div variants={item}>
          <Textarea
            label="Informações extras"
            value={form.extra}
            onChange={set("extra")}
            rows={4}
            placeholder="Diferenciais, valores, restrições de linguagem, palavras a evitar…"
            hint="Tudo isso ajuda a IA a escrever no tom exato da marca."
          />
        </motion.div>

        <motion.div variants={item} className="company-form-actions">
          <Button type="submit" icon={<Save />} loading={saving} disabled={removing}>
            {isEdit ? "Salvar alterações" : "Criar empresa"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/app")}
            disabled={saving || removing}
          >
            Cancelar
          </Button>
          {isEdit && (
            <Button
              type="button"
              variant="danger"
              icon={<Trash2 />}
              className="ml-auto"
              onClick={handleRemove}
              loading={removing}
              disabled={saving}
            >
              Remover
            </Button>
          )}
        </motion.div>
      </motion.form>

      <div className="company-preview-col">
        <BrandPreview form={form} />
      </div>
    </div>
  );
}
