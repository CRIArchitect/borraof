// ─────────────────────────────────────────────────────────────
// Borrão — client-side image synthesis for the Image Studio.
// In DEMO mode the backend returns descriptors and we render a
// branded mock here (clean canvas origin → fully exportable).
// With a real backend, descriptors carry a `url` we use directly.
// ─────────────────────────────────────────────────────────────

export const RATIOS = [
  { id: "1:1", label: "Feed", sub: "1:1", w: 1080, h: 1080 },
  { id: "4:5", label: "Feed alto", sub: "4:5", w: 1080, h: 1350 },
  { id: "9:16", label: "Stories", sub: "9:16", w: 1080, h: 1920 },
  { id: "16:9", label: "Wide", sub: "16:9", w: 1920, h: 1080 },
];

export function ratioById(id) {
  return RATIOS.find((r) => r.id === id) || RATIOS[0];
}

// Deterministic PRNG so a given seed reproduces the same art.
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexA(hex, a) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

const COMPANIONS = ["#C77DFF", "#74C0FC", "#FFB347", "#6EE7B7", "#FF6B6B"];

/**
 * Render a branded abstract "generated" image to a PNG data URL.
 * @param {object} o { w, h, color, seed, transparent, expand }
 */
export function renderArt(o = {}) {
  const w = o.w || 1080;
  const h = o.h || 1080;
  const color = o.color || "#FC4B08";
  const seed = (o.seed || 1) >>> 0;
  const rnd = mulberry32(seed);

  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");

  if (o.transparent) {
    ctx.clearRect(0, 0, w, h);
  } else {
    const base = ctx.createLinearGradient(0, 0, w, h);
    base.addColorStop(0, "#0b0b0d");
    base.addColorStop(1, "#050506");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
  }

  // Soft colour blobs (gradient mesh feel)
  const blobs = 5 + Math.floor(rnd() * 3);
  for (let i = 0; i < blobs; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    const r = (0.25 + rnd() * 0.55) * Math.max(w, h);
    const col = i === 0 ? color : (rnd() < 0.55 ? color : COMPANIONS[Math.floor(rnd() * COMPANIONS.length)]);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, hexA(col, o.transparent ? 0.62 : 0.5));
    g.addColorStop(1, hexA(col, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  // Geometric accents
  ctx.globalCompositeOperation = "lighter";
  const shapes = 3 + Math.floor(rnd() * 4);
  for (let i = 0; i < shapes; i++) {
    ctx.save();
    ctx.translate(rnd() * w, rnd() * h);
    ctx.rotate(rnd() * Math.PI);
    ctx.strokeStyle = hexA(i % 2 ? color : "#ffffff", 0.12 + rnd() * 0.12);
    ctx.lineWidth = 2 + rnd() * 4;
    const s = (0.1 + rnd() * 0.3) * Math.max(w, h);
    if (rnd() < 0.5) {
      ctx.strokeRect(-s / 2, -s / 2, s, s);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.globalCompositeOperation = "source-over";

  // Grain
  const dots = Math.floor((w * h) / 2600);
  ctx.fillStyle = "rgba(255,255,255,0.025)";
  for (let i = 0; i < dots; i++) {
    ctx.fillRect(rnd() * w, rnd() * h, 1, 1);
  }

  // Vignette
  const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);

  return c.toDataURL("image/png");
}

/** Resolve a studio image descriptor to a usable <img> src. */
export function resolveSrc(img) {
  if (img?.url) return img.url; // real backend
  const { w, h } = img.ratio ? ratioById(img.ratio) : { w: 1080, h: 1080 };
  return renderArt({ w, h, color: img.color, seed: img.seed, transparent: img.transparent });
}

let _seq = 1;
export function newSeed() {
  // Avoids Math.random dependency for stable-ish uniqueness within a session.
  return (Date.now() % 100000) + _seq++ * 7919;
}
