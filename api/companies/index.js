import { supabase } from "../_lib/supabase.js";
import { requireAuth } from "../_lib/requireAuth.js";
import { applyCors } from "../_lib/cors.js";

const MAX_COMPANIES = 5;

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  const user = requireAuth(req, res);
  if (!user) return;

  if (req.method === "GET") {
    const result = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (result.error) {
      console.error("[companies GET]", result.error);
      return res.status(500).json({ detail: "Erro ao listar empresas" });
    }
    return res.status(200).json(result.data || []);
  }

  if (req.method === "POST") {
    const body = req.body || {};
    if (!body.name || !String(body.name).trim()) {
      return res.status(400).json({ detail: "Nome da empresa é obrigatório" });
    }

    const existing = await supabase
      .from("companies")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if ((existing.count || 0) >= MAX_COMPANIES) {
      return res.status(400).json({ detail: `Limite de ${MAX_COMPANIES} empresas atingido` });
    }

    const insert = await supabase
      .from("companies")
      .insert({
        user_id: user.id,
        name: String(body.name).trim(),
        segment: body.segment || "",
        tone: body.tone || "",
        audience: body.audience || "",
        description: body.description || "",
        mission: body.mission || "",
        do_say: body.do_say || "",
        dont_say: body.dont_say || "",
        example_post: body.example_post || "",
        visual_style: body.visual_style || "",
        color: body.color || "#FC4B08",
      })
      .select("*")
      .single();

    if (insert.error) {
      console.error("[companies POST]", insert.error);
      return res.status(500).json({ detail: "Erro ao criar empresa" });
    }
    return res.status(200).json(insert.data);
  }

  return res.status(405).json({ detail: "Método não permitido" });
}
