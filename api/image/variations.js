import { supabase } from "../_lib/supabase.js";
import { requireAuth } from "../_lib/requireAuth.js";
import { applyCors } from "../_lib/cors.js";
import { replicate, FLUX_MODEL } from "../_lib/replicate.js";
import { downloadAsBuffer, uploadBufferToSupabase, pickReplicateUrl } from "../_lib/imageUpload.js";

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  const user = requireAuth(req, res);
  if (!user) return;
  if (req.method !== "POST") return res.status(405).json({ detail: "Método não permitido" });

  const { prompt, company_id } = req.body || {};
  if (!prompt) return res.status(400).json({ detail: "Prompt obrigatório" });

  const results = [];
  const errors = [];

  for (let i = 0; i < 3; i++) {
    try {
      const output = await replicate.run(FLUX_MODEL, {
        input: {
          prompt: prompt,
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "png",
          output_quality: 90,
          num_inference_steps: 4,
          seed: Math.floor(Math.random() * 1000000),
        },
      });
      const url = pickReplicateUrl(output);
      const buffer = await downloadAsBuffer(url);
      const publicUrl = await uploadBufferToSupabase(buffer, user.id);

      const insert = await supabase.from("generations").insert({
        user_id: user.id,
        company_id: company_id || null,
        company_name_snapshot: "Variação",
        content_type: "image",
        briefing: `Variação ${i + 1}`,
        result: `[variation]\nPROMPT: ${prompt}`,
        image_url: publicUrl,
      }).select("id, created_at").single();

      results.push({
        id: insert.data?.id,
        image_url: publicUrl,
        seed: i + 1,
        created_at: insert.data?.created_at,
      });
    } catch (err) {
      console.error(`[variation ${i}]`, err);
      errors.push(err.message);
    }
  }

  if (results.length === 0) {
    return res.status(500).json({ detail: "Falha em todas as variações", errors });
  }

  return res.status(200).json({ images: results, errors: errors.length ? errors : undefined });
}
