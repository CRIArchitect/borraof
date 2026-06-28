import { supabase } from "../_lib/supabase.js";
import { requireAuth } from "../_lib/requireAuth.js";
import { applyCors } from "../_lib/cors.js";
import { replicate, OUTPAINT_MODEL } from "../_lib/replicate.js";
import { downloadAsBuffer, uploadBufferToSupabase, pickReplicateUrl } from "../_lib/imageUpload.js";

const DIRECTION_PROMPTS = {
  up: "extend the scene upward naturally, matching style, lighting and colours",
  down: "extend the scene downward naturally, matching style, lighting and colours",
  left: "extend the scene to the left naturally, matching style, lighting and colours",
  right: "extend the scene to the right naturally, matching style, lighting and colours",
  all: "extend the scene in all directions naturally, matching style, lighting and colours",
};

// Lê width/height do cabeçalho PNG (IHDR @ offsets 16/20, big-endian).
function pngSize(buf) {
  if (buf.length > 24 && buf[0] === 0x89 && buf[1] === 0x50) {
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  }
  return { w: 1024, h: 1024 };
}

// bria/expand-image só aceita aspect_ratio de um enum fixo. Direita/esquerda/all
// expandem em largura (16:9); cima/baixo expandem em altura (9:16). O canvas é
// casado com o aspect e a original é posicionada conforme a direção.
function layout(dir, w, h) {
  const ar = dir === "up" || dir === "down" ? "9:16" : "16:9";
  const [rw, rh] = ar.split(":").map(Number);
  const R = rw / rh;
  if (R >= 1) {
    const W = Math.round(h * R);
    const x = dir === "right" ? 0 : dir === "left" ? W - w : Math.round((W - w) / 2);
    return { ar, canvas: [W, h], loc: [Math.max(0, x), 0] };
  }
  const H = Math.round(w / R);
  const y = dir === "down" ? 0 : dir === "up" ? H - h : Math.round((H - h) / 2);
  return { ar, canvas: [w, H], loc: [0, Math.max(0, y)] };
}

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  const user = requireAuth(req, res);
  if (!user) return;
  if (req.method !== "POST") return res.status(405).json({ detail: "Método não permitido" });

  const { image_url, direction, company_id } = req.body || {};
  if (!image_url) return res.status(400).json({ detail: "image_url obrigatório" });
  const dir = DIRECTION_PROMPTS[direction] ? direction : "all";

  let resultUrl;
  try {
    const srcBuf = await downloadAsBuffer(image_url);
    const { w, h } = pngSize(srcBuf);
    const { ar, canvas, loc } = layout(dir, w, h);

    const output = await replicate.run(OUTPAINT_MODEL, {
      input: {
        image_url,
        aspect_ratio: ar,
        canvas_size: canvas,
        original_image_size: [w, h],
        original_image_location: loc,
        prompt: DIRECTION_PROMPTS[dir],
        preserve_alpha: false,
        sync: true,
      },
    });
    const replicateUrl = pickReplicateUrl(output);
    const buffer = await downloadAsBuffer(replicateUrl);
    resultUrl = await uploadBufferToSupabase(buffer, user.id);
  } catch (err) {
    console.error("[outpaint]", err);
    return res.status(500).json({ detail: "Erro ao expandir imagem: " + err.message });
  }

  const insert = await supabase.from("generations").insert({
    user_id: user.id,
    company_id: company_id || null,
    company_name_snapshot: "Expandido",
    content_type: "image",
    briefing: `Expandir (${dir})`,
    result: `[outpaint ${dir}]`,
    image_url: resultUrl,
  }).select("id, created_at").single();

  return res.status(200).json({
    id: insert.data?.id,
    image_url: resultUrl,
    direction: dir,
    created_at: insert.data?.created_at,
  });
}
