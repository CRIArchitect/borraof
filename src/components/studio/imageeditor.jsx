import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Crop, Type, Image as ImageIcon, Plus, Trash2, Download, Tag } from "lucide-react";
import { RATIOS, ratioById } from "../../lib/imagegen";
import { overlay, scaleIn } from "../../lib/motion";
import { useToast } from "../../context/toastcontext";
import Button from "../common/button";

const TEXT_COLORS = ["#FFFFFF", "#000000", "#FC4B08", "#FFC840", "#6EE7B7"];
const BG_COLORS = ["#0b0b0d", "#FFFFFF", "#FC4B08", "#111114", "#C77DFF", "#74C0FC"];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
let _tid = 1;

export default function ImageEditor({ open, source, brand, onClose }) {
  const toast = useToast();
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const dragRef = useRef(null);

  const [ratioId, setRatioId] = useState(source?.ratio || "1:1");
  const [imgZoom, setImgZoom] = useState(1);
  const [imgOff, setImgOff] = useState({ x: 0, y: 0 });
  const [bg, setBg] = useState("#0b0b0d");
  const [texts, setTexts] = useState([]);
  const [logo, setLogo] = useState({ on: false, x: 0.5, y: 0.9, color: brand?.color || "#FC4B08" });
  const [sel, setSel] = useState(null);
  const [ready, setReady] = useState(false);

  // (re)load the source image
  useEffect(() => {
    if (!open || !source?.src) return;
    setReady(false);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { imgRef.current = img; setReady(true); };
    img.onerror = () => { imgRef.current = null; setReady(true); };
    img.src = source.src;
  }, [open, source]);

  // reset when opening a new source
  useEffect(() => {
    if (!open) return;
    setRatioId(source?.ratio || "1:1");
    setImgZoom(1); setImgOff({ x: 0, y: 0 }); setBg("#0b0b0d"); setTexts([]); setSel(null);
    setLogo({ on: false, x: 0.5, y: 0.9, color: brand?.color || "#FC4B08" });
  }, [open, source, brand]);

  const drawScene = useCallback((ctx, W, H) => {
    // background
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    // image (cover + zoom + offset)
    const img = imgRef.current;
    if (img) {
      const cover = Math.max(W / img.width, H / img.height) * imgZoom;
      const dw = img.width * cover;
      const dh = img.height * cover;
      const dx = (W - dw) / 2 + imgOff.x * W;
      const dy = (H - dh) / 2 + imgOff.y * H;
      ctx.drawImage(img, dx, dy, dw, dh);
    }
    // text layers
    texts.forEach((t) => {
      const px = t.x * W, py = t.y * H, fs = t.size * H;
      ctx.font = `${t.weight} ${fs}px Syne, "DM Sans", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = fs * 0.18;
      ctx.fillStyle = t.color;
      const lines = t.text.split("\n");
      lines.forEach((ln, i) => ctx.fillText(ln, px, py + (i - (lines.length - 1) / 2) * fs * 1.12));
      ctx.shadowBlur = 0;
      if (sel === t.id) outline(ctx, px, py, Math.max(...lines.map((l) => ctx.measureText(l).width)) + fs * 0.4, fs * lines.length * 1.2);
    });
    // brand logo pill
    if (logo.on) {
      const name = brand?.name || "Borrão";
      const fs = 0.045 * H;
      ctx.font = `700 ${fs}px Syne, sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      const tw = ctx.measureText(name).width;
      const padX = fs * 0.7, padY = fs * 0.5, dot = fs * 0.55, gap = fs * 0.4;
      const boxW = padX * 2 + dot + gap + tw, boxH = fs + padY * 2;
      const bx = clamp(logo.x * W - boxW / 2, 0, W - boxW);
      const by = clamp(logo.y * H - boxH / 2, 0, H - boxH);
      roundRect(ctx, bx, by, boxW, boxH, boxH / 2);
      ctx.fillStyle = "rgba(0,0,0,0.42)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bx + padX + dot / 2, by + boxH / 2, dot / 2, 0, Math.PI * 2);
      ctx.fillStyle = logo.color;
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillText(name, bx + padX + dot + gap, by + boxH / 2 + 1);
      if (sel === "logo") outline(ctx, bx + boxW / 2, by + boxH / 2, boxW, boxH);
    }
  }, [bg, imgZoom, imgOff, texts, logo, sel, brand]);

  // redraw on any change
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || !open) return;
    const { w, h } = ratioById(ratioId);
    const maxH = 460, maxW = 560;
    const scale = Math.min(maxW / w, maxH / h);
    cv.width = Math.round(w * scale);
    cv.height = Math.round(h * scale);
    drawScene(cv.getContext("2d"), cv.width, cv.height);
  }, [open, ratioId, ready, drawScene]);

  // ── pointer drag ──
  const ptr = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };
  const hit = (p) => {
    if (logo.on && Math.abs(p.x - logo.x) < 0.16 && Math.abs(p.y - logo.y) < 0.05) return { kind: "logo" };
    for (let i = texts.length - 1; i >= 0; i--) {
      const t = texts[i];
      const hw = Math.max(0.12, t.text.length * t.size * 0.32), hh = t.size * (t.text.split("\n").length) * 0.8;
      if (Math.abs(p.x - t.x) < hw && Math.abs(p.y - t.y) < hh) return { kind: "text", id: t.id };
    }
    return { kind: "image" };
  };
  const onDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const p = ptr(e);
    const target = hit(p);
    setSel(target.kind === "text" ? target.id : target.kind === "logo" ? "logo" : null);
    let orig;
    if (target.kind === "image") orig = { ...imgOff };
    else if (target.kind === "logo") orig = { x: logo.x, y: logo.y };
    else orig = { ...texts.find((t) => t.id === target.id) };
    dragRef.current = { target, start: p, orig };
  };
  const onMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const p = ptr(e);
    const dx = p.x - d.start.x, dy = p.y - d.start.y;
    if (d.target.kind === "image") setImgOff({ x: clamp(d.orig.x + dx, -0.6, 0.6), y: clamp(d.orig.y + dy, -0.6, 0.6) });
    else if (d.target.kind === "logo") setLogo((l) => ({ ...l, x: clamp(d.orig.x + dx, 0, 1), y: clamp(d.orig.y + dy, 0, 1) }));
    else setTexts((ts) => ts.map((t) => (t.id === d.target.id ? { ...t, x: clamp(d.orig.x + dx, 0, 1), y: clamp(d.orig.y + dy, 0, 1) } : t)));
  };
  const onUp = () => { dragRef.current = null; };

  // ── text helpers ──
  const addText = () => {
    const id = _tid++;
    setTexts((ts) => [...ts, { id, text: "Sua mensagem", x: 0.5, y: 0.5, size: 0.08, color: "#FFFFFF", weight: 800 }]);
    setSel(id);
  };
  const updText = (id, patch) => setTexts((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const delText = (id) => { setTexts((ts) => ts.filter((t) => t.id !== id)); setSel(null); };

  const exportPng = () => {
    const { w, h } = ratioById(ratioId);
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    drawScene(c.getContext("2d"), w, h);
    c.toBlob((blob) => {
      if (!blob) return toast.error("Falha ao exportar");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `borrao-${ratioId.replace(":", "x")}-${Date.now()}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      toast.success("Imagem exportada", `${w}×${h}px`);
    }, "image/png");
  };

  const activeText = texts.find((t) => t.id === sel);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="editor-overlay" variants={overlay} initial="hidden" animate="show" exit="exit" onClick={onClose}>
          <motion.div className="editor-box" variants={scaleIn} role="dialog" aria-modal="true" aria-label="Editor de imagem" onClick={(e) => e.stopPropagation()}>
            <div className="editor-head">
              <span className="editor-title"><Crop /> Editar imagem</span>
              <button className="modal-close" onClick={onClose} aria-label="Fechar"><X size={16} /></button>
            </div>

            <div className="editor-stage">
              <canvas
                ref={canvasRef}
                className="editor-canvas"
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerLeave={onUp}
              />
            </div>

            <div className="editor-side">
              <div className="editor-section">
                <div className="editor-section-title"><Crop /> Formato</div>
                <div className="fmt-row">
                  {RATIOS.map((r) => (
                    <button key={r.id} className={`fmt-btn ${ratioId === r.id ? "selected" : ""}`} onClick={() => setRatioId(r.id)}>{r.sub}</button>
                  ))}
                </div>
              </div>

              <div className="editor-section">
                <div className="editor-section-title"><ImageIcon /> Imagem</div>
                <label className="text-xs text-muted">Zoom</label>
                <input className="slider" type="range" min="1" max="3" step="0.01" value={imgZoom} onChange={(e) => setImgZoom(+e.target.value)} aria-label="Zoom da imagem" />
                <p className="text-xs text-faint mt-4">Arraste a imagem no canvas para reposicionar.</p>
              </div>

              <div className="editor-section">
                <div className="editor-section-title"><Type /> Texto</div>
                {activeText ? (
                  <>
                    <textarea className="field-textarea" rows={2} value={activeText.text} onChange={(e) => updText(activeText.id, { text: e.target.value })} aria-label="Texto" style={{ minHeight: 56, marginBottom: 8 }} />
                    <label className="text-xs text-muted">Tamanho</label>
                    <input className="slider" type="range" min="0.03" max="0.2" step="0.005" value={activeText.size} onChange={(e) => updText(activeText.id, { size: +e.target.value })} aria-label="Tamanho do texto" />
                    <div className="color-mini-row mt-8">
                      {TEXT_COLORS.map((c) => (
                        <button key={c} className={`swatch-mini ${activeText.color === c ? "on" : ""}`} style={{ background: c }} onClick={() => updText(activeText.id, { color: c })} aria-label={`Cor ${c}`} />
                      ))}
                    </div>
                    <button className="studio-chip-btn mt-12" onClick={() => delText(activeText.id)}><Trash2 /> Remover texto</button>
                  </>
                ) : (
                  <p className="text-xs text-faint mb-8">Selecione um texto no canvas para editar.</p>
                )}
                <button className="studio-chip-btn mt-8" onClick={addText}><Plus /> Adicionar texto</button>
              </div>

              <div className="editor-section">
                <div className="editor-section-title"><Tag /> Marca</div>
                <label className="text-layer-row" style={{ cursor: "pointer" }}>
                  <input type="checkbox" checked={logo.on} onChange={(e) => setLogo((l) => ({ ...l, on: e.target.checked }))} />
                  <span className="text-sm">Mostrar selo da marca</span>
                </label>
                {logo.on && (
                  <div className="color-mini-row mt-8">
                    {[brand?.color || "#FC4B08", "#FFFFFF", "#000000"].map((c) => (
                      <button key={c} className={`swatch-mini ${logo.color === c ? "on" : ""}`} style={{ background: c }} onClick={() => setLogo((l) => ({ ...l, color: c }))} aria-label={`Cor selo ${c}`} />
                    ))}
                  </div>
                )}
              </div>

              <div className="editor-section">
                <div className="editor-section-title">Fundo</div>
                <div className="color-mini-row">
                  {BG_COLORS.map((c) => (
                    <button key={c} className={`swatch-mini ${bg === c ? "on" : ""}`} style={{ background: c }} onClick={() => setBg(c)} aria-label={`Fundo ${c}`} />
                  ))}
                </div>
              </div>

              <div className="editor-actions">
                <Button variant="secondary" size="sm" onClick={onClose}>Fechar</Button>
                <Button size="sm" full icon={<Download size={15} />} onClick={exportPng}>Exportar PNG</Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function outline(ctx, cx, cy, w, h) {
  ctx.save();
  ctx.strokeStyle = "rgba(252,75,8,0.9)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.strokeRect(cx - w / 2 - 6, cy - h / 2 - 6, w + 12, h + 12);
  ctx.restore();
}
