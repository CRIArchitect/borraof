import { supabase } from "../_lib/supabase.js";
import { requireAuth } from "../_lib/requireAuth.js";
import { applyCors } from "../_lib/cors.js";

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  const user = requireAuth(req, res);
  if (!user) return;

  const { id } = req.query;
  if (!id) return res.status(400).json({ detail: "ID obrigatório" });

  if (req.method === "GET") {
    const result = await supabase
      .from("generations")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!result.data) return res.status(404).json({ detail: "Geração não encontrada" });

    const g = result.data;
    return res.status(200).json({
      id: g.id,
      company_id: g.company_id,
      company_name: g.company_name_snapshot,
      type: g.content_type,
      brief: g.briefing,
      result: g.result,
      image_url: g.image_url,
      created_at: g.created_at,
    });
  }

  if (req.method === "DELETE") {
    const del = await supabase
      .from("generations")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (del.error) {
      console.error("[history DELETE]", del.error);
      return res.status(500).json({ detail: "Erro ao remover" });
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ detail: "Método não permitido" });
}
