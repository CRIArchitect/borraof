import { useRef, useState } from "react";
import { Sparkles, Dice5, Upload, Minus, Plus } from "lucide-react";
import { Select, Textarea } from "../common/field";
import Button from "../common/button";
import { RATIOS, newSeed } from "../../lib/imagegen";

const PROMPTS = [
  "Foto de produto em fundo minimalista com luz suave",
  "Cena lifestyle vibrante para campanha de verão",
  "Composição abstrata com a cor da marca",
  "Flat lay aconchegante para post de feed",
];

export default function StudioControls({ companies, generating, onGenerate, onUpload }) {
  const [companyId, setCompanyId] = useState(companies[0]?.id || "");
  const [prompt, setPrompt] = useState("");
  const [ratio, setRatio] = useState("1:1");
  const [n, setN] = useState(4);
  const [seed, setSeed] = useState("");
  const fileRef = useRef(null);

  const company = companies.find((c) => String(c.id) === String(companyId));

  function submit(e) {
    e.preventDefault();
    if (!prompt.trim() || !companyId) return;
    onGenerate({ company_id: companyId, prompt: prompt.trim(), ratio, n, seed: seed ? Number(seed) : newSeed(), company });
  }

  return (
    <form className="panel studio-controls" onSubmit={submit}>
      <p className="panel-title"><Sparkles /> Gerar imagem</p>

      <div className="studio-field">
        <Select label="Marca" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
          {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </div>

      <div className="studio-field">
        <Textarea
          label="Descreva a imagem"
          placeholder="Ex: foto de um café cremoso visto de cima, fundo de madeira rústica, luz natural…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
        />
        <div className="flex flex-wrap gap-6 mt-8">
          {PROMPTS.map((p) => (
            <button type="button" key={p} className="chip" style={{ fontSize: 11 }} onClick={() => setPrompt(p)}>
              {p.length > 34 ? p.slice(0, 32) + "…" : p}
            </button>
          ))}
        </div>
      </div>

      <div className="studio-field">
        <span className="studio-field-label">Formato</span>
        <div className="ratio-row">
          {RATIOS.map((r) => {
            const big = r.w >= r.h;
            const gw = big ? 22 : 22 * (r.w / r.h);
            const gh = big ? 22 * (r.h / r.w) : 22;
            return (
              <button
                type="button"
                key={r.id}
                className={`ratio-btn ${ratio === r.id ? "selected" : ""}`}
                onClick={() => setRatio(r.id)}
                aria-pressed={ratio === r.id}
              >
                <span className="ratio-glyph" style={{ width: gw, height: gh }} />
                <span className="ratio-label">{r.label}</span>
                <span className="ratio-sub">{r.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="studio-field">
        <span className="studio-field-label">Variações</span>
        <div className="count-pill">
          <button type="button" onClick={() => setN((v) => Math.max(1, v - 1))} disabled={n <= 1} aria-label="Menos"><Minus size={14} /></button>
          <span className="count-val">{n}</span>
          <button type="button" onClick={() => setN((v) => Math.min(6, v + 1))} disabled={n >= 6} aria-label="Mais"><Plus size={14} /></button>
        </div>
      </div>

      <div className="studio-field">
        <span className="studio-field-label">Semente (opcional)</span>
        <div className="seed-row">
          <input className="field-input seed-input" inputMode="numeric" placeholder="aleatória" value={seed} onChange={(e) => setSeed(e.target.value.replace(/\D/g, ""))} aria-label="Semente" />
          <button type="button" className="icon-btn tip" data-tip="Sortear" onClick={() => setSeed(String(newSeed()))} aria-label="Sortear semente"><Dice5 /></button>
        </div>
      </div>

      <Button type="submit" full loading={generating} icon={<Sparkles size={15} />} disabled={!prompt.trim() || !companyId}>
        {generating ? "Gerando…" : `Gerar ${n} ${n > 1 ? "imagens" : "imagem"}`}
      </Button>

      <div className="divider" />

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f, company); e.target.value = ""; }} />
      <Button type="button" variant="secondary" full icon={<Upload size={15} />} onClick={() => fileRef.current?.click()}>
        Enviar imagem própria
      </Button>
    </form>
  );
}
