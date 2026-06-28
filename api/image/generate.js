import { supabase } from "../_lib/supabase.js";
import { requireAuth } from "../_lib/requireAuth.js";
import { applyCors } from "../_lib/cors.js";
import { groq, GROQ_MODEL } from "../_lib/groq.js";
import { replicate, FLUX_MODEL } from "../_lib/replicate.js";
import { buildCompanyContext, IMAGE_TRANSLATION_PROMPT } from "../_lib/prompts.js";
import { downloadAsBuffer, uploadBufferToSupabase, pickReplicateUrl } from "../_lib/imageUpload.js";

async function translateBriefToVisualPrompt(brief, context) {
  const userPrompt = `${context}\n\nBriefing (Portuguese): ${brief}`;
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: IMAGE_TRANSLATION_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.5,
    max_tokens: 400,
    response_format: { type: "json_object" },
  });
  const raw = completion.choices?.[0]?.message?.content?.trim() || "{}";
  try {
    const data = JSON.parse(raw);
    return {
      prompt: (data.prompt || "").trim(),
      negative_prompt: (data.negative_prompt || "").trim(),
      classification: data.classification || "unknown",
    };
  } catch {
    return { prompt: raw, negative_prompt: "deformed faces, text, watermark, logo", classification: "unknown" };
  }
}

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  const user = requireAuth(req, res);
  if (!user) return;
  if (req.method !== "POST") return res.status(405).json({ detail: "Método não permitido" });

  const { company_id, brief, ratio, n, seed } = req.body || {};
  if (!company_id) return res.status(400).json({ detail: "company_id obrigatório" });
  if (!brief || !String(brief).trim()) return res.status(400).json({ detail: "Briefing não pode estar vazio" });

  const companyResult = await supabase
    .from("companies").select("*").eq("id", company_id).eq("user_id", user.id).maybeSingle();
  if (!companyResult.data) return res.status(404).json({ detail: "Empresa não encontrada" });

  const company = companyResult.data;
  const context = buildCompanyContext(company);
  const cleanBrief = String(brief).trim();

  let visualData;
  try {
    visualData = await translateBriefToVisualPrompt(cleanBrief, context);
  } catch (err) {
    console.error("[image translate]", err);
    return res.status(500).json({ detail: "Erro ao traduzir briefing" });
  }

  // Formato/variações/semente vindos do estúdio (FLUX-schnell: até 4 saídas).
  const RATIOS_OK = ["1:1", "4:5", "5:4", "9:16", "16:9", "3:2", "2:3", "3:4", "4:3"];
  const aspect = RATIOS_OK.includes(ratio) ? ratio : "1:1";
  const count = Math.min(Math.max(parseInt(n) || 1, 1), 4);
  const resultDescription = `[${visualData.classification}]\n\nPROMPT:\n${visualData.prompt}\n\nNEGATIVE:\n${visualData.negative_prompt}`;

  let outputs;
  try {
    const input = {
      prompt: visualData.prompt,
      num_outputs: count,
      aspect_ratio: aspect,
      output_format: "png",
      output_quality: 90,
      num_inference_steps: 4,
    };
    if (seed !== undefined && seed !== null && seed !== "") input.seed = parseInt(seed);
    const out = await replicate.run(FLUX_MODEL, { input });
    outputs = Array.isArray(out) ? out : [out];
  } catch (err) {
    console.error("[image generate]", err);
    return res.status(500).json({ detail: "Erro ao gerar imagem: " + err.message });
  }

  const images = [];
  for (const o of outputs) {
    try {
      const url = typeof o?.url === "function" ? o.url() : typeof o === "string" ? o : String(o);
      const buffer = await downloadAsBuffer(url);
      const imageUrl = await uploadBufferToSupabase(buffer, user.id);
      const insert = await supabase.from("generations").insert({
        user_id: user.id,
        company_id: company.id,
        company_name_snapshot: company.name,
        content_type: "image",
        briefing: cleanBrief,
        result: resultDescription,
        image_url: imageUrl,
      }).select("id, created_at").single();
      images.push({
        id: insert.data?.id,
        image_url: imageUrl,
        prompt_used: visualData.prompt,
        classification: visualData.classification,
        ratio: aspect,
        created_at: insert.data?.created_at,
      });
    } catch (err) {
      console.error("[image upload]", err);
    }
  }

  if (!images.length) return res.status(500).json({ detail: "Falha ao processar as imagens geradas" });

  // { images } + campos da primeira no topo (compat)
  return res.status(200).json({ images, ...images[0] });
}
