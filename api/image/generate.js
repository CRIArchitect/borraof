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

  const { company_id, brief } = req.body || {};
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

  let imageUrl;
  try {
    const output = await replicate.run(FLUX_MODEL, {
      input: {
        prompt: visualData.prompt,
        num_outputs: 1,
        aspect_ratio: "1:1",
        output_format: "png",
        output_quality: 90,
        num_inference_steps: 4,
      },
    });
    const replicateUrl = pickReplicateUrl(output);
    const buffer = await downloadAsBuffer(replicateUrl);
    imageUrl = await uploadBufferToSupabase(buffer, user.id);
  } catch (err) {
    console.error("[image generate]", err);
    return res.status(500).json({ detail: "Erro ao gerar imagem: " + err.message });
  }

  const resultDescription = `[${visualData.classification}]\n\nPROMPT:\n${visualData.prompt}\n\nNEGATIVE:\n${visualData.negative_prompt}`;

  const insert = await supabase.from("generations").insert({
    user_id: user.id,
    company_id: company.id,
    company_name_snapshot: company.name,
    content_type: "image",
    briefing: cleanBrief,
    result: resultDescription,
    image_url: imageUrl,
  }).select("*").single();

  return res.status(200).json({
    id: insert.data?.id,
    image_url: imageUrl,
    prompt_used: visualData.prompt,
    classification: visualData.classification,
    created_at: insert.data?.created_at,
  });
}
