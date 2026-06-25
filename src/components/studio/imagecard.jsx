import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Layers, Scissors, Maximize2, Download, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import { item } from "../../lib/motion";
import { resolveSrc, ratioById } from "../../lib/imagegen";

const AI_OPS = [
  { op: "variations", label: "Variações", icon: Layers },
  { op: "remove-bg", label: "Remover fundo", icon: Scissors },
  { op: "outpaint", label: "Expandir", icon: Maximize2 },
];

const DIRECTIONS = [
  { id: "up", label: "Cima", icon: ArrowUp },
  { id: "down", label: "Baixo", icon: ArrowDown },
  { id: "left", label: "Esquerda", icon: ArrowLeft },
  { id: "right", label: "Direita", icon: ArrowRight },
  { id: "all", label: "Todos", icon: Expand },
];

export default function ImageCard({ image, onEdit, onAiEdit, onDownload, busy }) {
  const r = ratioById(image.ratio);
  const src = resolveSrc(image);
  const [showDirections, setShowDirections] = useState(false);

  function handleOpClick(op) {
    if (op === "outpaint") {
      setShowDirections(true);
      return;
    }
    onAiEdit(image, op);
  }

  function handleDirectionClick(direction) {
    setShowDirections(false);
    onAiEdit(image, "outpaint", { direction });
  }

  return (
    <motion.div variants={item} className="studio-img" style={{ "--ar": r.w / r.h }}>
      <img src={src} alt={image.prompt || "Imagem gerada"} loading="lazy" />
      <div className="studio-img-overlay">
        <button className="studio-chip-btn studio-img-edit" onClick={() => onEdit(image)}>
          <Pencil /> Editar
        </button>
        <div className="studio-img-actions">
          {AI_OPS.map(({ op, label, icon: Icon }) => (
            <button key={op} className="studio-chip-btn" disabled={busy} onClick={() => handleOpClick(op)}>
              <Icon /> {label}
            </button>
          ))}
          <button className="studio-chip-btn" onClick={() => onDownload(image)}>
            <Download /> Baixar
          </button>
        </div>

        <AnimatePresence>
          {showDirections && (
            <motion.div
              className="studio-directions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.78)",
                backdropFilter: "blur(8px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: 16,
                zIndex: 5,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>Expandir para:</span>
                <button
                  onClick={() => setShowDirections(false)}
                  style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", padding: 4 }}
                  aria-label="Fechar"
                >
                  <X size={16} />
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, width: "100%", maxWidth: 220 }}>
                <div />
                <button className="studio-chip-btn" disabled={busy} onClick={() => handleDirectionClick("up")} style={{ justifyContent: "center" }}>
                  <ArrowUp />
                </button>
                <div />
                <button className="studio-chip-btn" disabled={busy} onClick={() => handleDirectionClick("left")} style={{ justifyContent: "center" }}>
                  <ArrowLeft />
                </button>
                <button className="studio-chip-btn" disabled={busy} onClick={() => handleDirectionClick("all")} style={{ justifyContent: "center" }}>
                  <Expand />
                </button>
                <button className="studio-chip-btn" disabled={busy} onClick={() => handleDirectionClick("right")} style={{ justifyContent: "center" }}>
                  <ArrowRight />
                </button>
                <div />
                <button className="studio-chip-btn" disabled={busy} onClick={() => handleDirectionClick("down")} style={{ justifyContent: "center" }}>
                  <ArrowDown />
                </button>
                <div />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
