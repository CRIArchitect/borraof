import { supabase } from "../_lib/supabase.js";
import { requireAuth } from "../_lib/requireAuth.js";
import { applyCors } from "../_lib/cors.js";
import { replicate, OUTPAINT_MODEL } from "../_lib/replicate.js";
import { downloadAsBuffer, uploadBufferToSupabase, pickReplicateUrl } from "../_lib/imageUpload.js";

const DIRECTION_PROMPTS = {
  up: "extend the scene upward naturally, matching style and lighting",
  down: "extend the scene downward naturally, matching style and lighting",
  left: "extend the scene to the left naturally, matching style and lighting",
  right: "extend the scene to the right naturally, matching style and lighting",
  all: "extend the scene in all directions naturally, matching style and lighting",
};

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  const user = requireAuth(req, res);
  if (!user) return;
  if (req.method !== "POST") return res.status(405).json({ detail: "Método não permitido" });

  const { image_url, direction, company_id } = req.body || {};
  if (!image_url) return res.status(400).json({ detail: "image_url obrigatório" });
  const dir = DIRECTION_PROMPTS[direction] ? direction : "all";
  const promptText = DIRECTION_PROMPTS[dir];

  let resultUrl;
  try {
    const output = await replicate.run(OUTPAINT_MODEL, {
      input: {
        image: image_url,
        prompt: promptText,
        num_inference_steps: 25,
        guidance_scale: 7.5,
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
