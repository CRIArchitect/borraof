import { Palette } from "lucide-react";
import { COLOR_PALETTE } from "../../util/constants";

/**
 * BrandPreview — live preview of the brand as the form changes.
 * Shows a stylised card with brand dot/name in the chosen colour,
 * a tone chip and the key brand attributes.
 */
export default function BrandPreview({ form = {} }) {
  const brand = form.color || COLOR_PALETTE[0];
  const name = (form.name || "").trim();

  const rows = [
    { key: "Segmento", value: form.segment },
    { key: "Público", value: form.audience },
    { key: "Cidade", value: form.city },
  ];

  return (
    <div className="panel brand-preview" style={{ "--brand": brand }}>
      <div className="panel-title">
        <Palette aria-hidden />
        Prévia da marca
      </div>

      <div className="brand-preview-card">
        <div className="brand-preview-head">
          <span className="brand-preview-dot" aria-hidden />
          <span className={"brand-preview-name" + (name ? "" : " is-placeholder")}>
            {name || "Sua marca"}
          </span>
        </div>

        {form.tone && (
          <span className="brand-preview-tone">{form.tone}</span>
        )}

        <p className="brand-preview-quote">
          {form.extra?.trim()
            ? form.extra.trim()
            : "Conteúdo nítido, no tom certo, para cada publicação."}
        </p>

        <div className="brand-preview-rows">
          {rows.map((r) => (
            <div className="brand-preview-row" key={r.key}>
              <span className="brand-preview-key">{r.key}</span>
              <span className={"brand-preview-val" + (r.value ? "" : " is-empty")}>
                {r.value || "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
