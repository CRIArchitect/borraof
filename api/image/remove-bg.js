import { supabase } from "../_lib/supabase.js";
import { requireAuth } from "../_lib/requireAuth.js";
import { applyCors } from "../_lib/cors.js";
import { replicate, REMBG_MODEL } from "../_lib/replicate.js";
import { downloadAsBuffer, uploadBufferToSupabase, pickReplicateUrl } from "../_lib/imageUpload.js";

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  const user = requireAuth(req, res);
  if (!user) return;
  if (req.method !== "POST") return res.status(405).json({ detail: "Método não permitido" });

  const { image_url, company_id } = req.body || {};
  if (!image_url) return res.status(400).json({ detail: "image_url obrigatório" });

  let resultUrl;
  try {
    const output = await replicate.run(REMBG_MODEL, { input: { image: image_url } });
    const replicateUrl = pickReplicateUrl(output);
    const buffer = await downloadAsBuffer(replicateUrl);
    resultUrl = await uploadBufferToSupabase(buffer, user.id);
  } catch (err) {
    console.error("[remove-bg]", err);
    return res.status(500).json({ detail: "Erro ao remover fundo: " + err.message });
  }

  const insert = await supabase.from("generations").insert({
    user_id: user.id,
    company_id: company_id || null,
    company_name_snapshot: "Fundo removido",
    content_type: "image",
    briefing: "Remover fundo",
    result: "[remove-bg]",
    image_url: resultUrl,
  }).select("id, created_at").single();

  return res.status(200).json({
    id: insert.data?.id,
    image_url: resultUrl,
    created_at: insert.data?.created_at,
  });
}
