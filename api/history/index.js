import { supabase } from "../_lib/supabase.js";
import { requireAuth } from "../_lib/requireAuth.js";
import { applyCors } from "../_lib/cors.js";

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  const user = requireAuth(req, res);
  if (!user) return;

  if (req.method !== "GET") {
    return res.status(405).json({ detail: "Método não permitido" });
  }

  const { company_id, content_type, limit } = req.query;
  let query = supabase
    .from("generations")
    .select("id, company_id, company_name_snapshot, content_type, briefing, result, image_url, created_at")
    .eq("user_id", user.id);

  if (company_id) query = query.eq("company_id", company_id);
  if (content_type) query = query.eq("content_type", content_type);

  const max = Math.min(parseInt(limit) || 50, 200);
  query = query.order("created_at", { ascending: false }).limit(max);

  const result = await query;
  if (result.error) {
    console.error("[history GET]", result.error);
    return res.status(500).json({ detail: "Erro ao listar histórico" });
  }

  const mapped = (result.data || []).map((g) => ({
    id: g.id,
    company_id: g.company_id,
    company_name: g.company_name_snapshot,
    type: g.content_type,
    brief: g.briefing,
    result: g.result,
    image_url: g.image_url,
    created_at: g.created_at,
  }));

  return res.status(200).json(mapped);
}
