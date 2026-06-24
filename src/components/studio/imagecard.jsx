import { motion } from "framer-motion";
import { Pencil, Layers, Scissors, Maximize2, Wand2, Download } from "lucide-react";
import { item } from "../../lib/motion";
import { resolveSrc, ratioById } from "../../lib/imagegen";

const AI_OPS = [
  { op: "variations", label: "Variações", icon: Layers },
  { op: "remove-bg", label: "Remover fundo", icon: Scissors },
  { op: "outpaint", label: "Expandir", icon: Maximize2 },
  { op: "upscale", label: "Upscale", icon: Wand2 },
];

export default function ImageCard({ image, onEdit, onAiEdit, onDownload, busy }) {
  const r = ratioById(image.ratio);
  const src = resolveSrc(image);

  return (
    <motion.div variants={item} className="studio-img" style={{ "--ar": r.w / r.h }}>
      <img src={src} alt={image.prompt || "Imagem gerada"} loading="lazy" />
      <div className="studio-img-overlay">
        <button className="studio-chip-btn studio-img-edit" onClick={() => onEdit(image)}>
          <Pencil /> Editar
        </button>
        <div className="studio-img-actions">
          {AI_OPS.map(({ op, label, icon: Icon }) => (
            <button key={op} className="studio-chip-btn" disabled={busy} onClick={() => onAiEdit(image, op)}>
              <Icon /> {label}
            </button>
          ))}
          <button className="studio-chip-btn" onClick={() => onDownload(image)}>
            <Download /> Baixar
          </button>
        </div>
      </div>
    </motion.div>
  );
}
