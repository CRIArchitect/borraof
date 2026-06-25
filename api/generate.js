import { supabase } from "./_lib/supabase.js";
import { requireAuth } from "./_lib/requireAuth.js";
import { applyCors } from "./_lib/cors.js";
import { groq, GROQ_MODEL } from "./_lib/groq.js";
import { CONTENT_TYPES, buildCompanyContext } from "./_lib/prompts.js";

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  const user = requireAuth(req, res);
  if (!user) return;

  if (req.method !== "POST") {
    return res.status(405).json({ detail: "Método não permitido" });
  }

  const { company_id, type, brief } = req.body || {};

  if (!company_id) return res.status(400).json({ detail: "company_id obrigatório" });
  if (!type) return res.status(400).json({ detail: "type obrigatório" });
  if (!brief || !String(brief).trim()) {
    return res.status(400).json({ detail: "Briefing não pode estar vazio" });
  }

  const typeConfig = CONTENT_TYPES[type];
  if (!typeConfig) {
    return res.status(400).json({ detail: "Tipo de conteúdo inválido" });
  }

  const companyResult = await supabase
    .from("companies")
    .select("*")
    .eq("id", company_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!companyResult.data) {
    return res.status(404).json({ detail: "Empresa não encontrada" });
  }

  const company = companyResult.data;
  const context = buildCompanyContext(company);
  const userPrompt = `${context}\n\nBriefing: ${String(brief).trim()}`;

  let resultText = "";
  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: typeConfig.system },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 1024,
    });
    resultText = completion.choices?.[0]?.message?.content?.trim() || "";
  } catch (err) {
    console.error("[generate groq]", err);
    return res.status(500).json({ detail: "Erro ao gerar conteúdo" });
  }

  if (!resultText) {
    return res.status(500).json({ detail: "Resposta vazia da IA" });
  }

  const insert = await supabase
    .from("generations")
    .insert({
      user_id: user.id,
      company_id: company.id,
      company_name_snapshot: company.name,
      content_type: type,
      briefing: String(brief).trim(),
      result: resultText,
    })
    .select("*")
    .single();

  if (insert.error) {
    console.error("[generate save]", insert.error);
    return res.status(200).json({ result: resultText, warning: "Não foi possível salvar no histórico" });
  }

  return res.status(200).json({
    id: insert.data.id,
    result: resultText,
    company_name: company.name,
    type,
    created_at: insert.data.created_at,
  });
}
