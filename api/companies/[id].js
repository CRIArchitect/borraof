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
      .from("companies")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!result.data) return res.status(404).json({ detail: "Empresa não encontrada" });
    return res.status(200).json(result.data);
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    const body = req.body || {};
    const allowed = ["name", "segment", "tone", "audience", "description", "mission", "do_say", "dont_say", "example_post", "visual_style", "color"];
    const updates = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    if (updates.name !== undefined && !String(updates.name).trim()) {
      return res.status(400).json({ detail: "Nome não pode ser vazio" });
    }

    const update = await supabase
      .from("companies")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (update.error) {
      console.error("[companies PUT]", update.error);
      return res.status(500).json({ detail: "Erro ao atualizar" });
    }
    return res.status(200).json(update.data);
  }

  if (req.method === "DELETE") {
    const del = await supabase
      .from("companies")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (del.error) {
      console.error("[companies DELETE]", del.error);
      return res.status(500).json({ detail: "Erro ao remover" });
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ detail: "Método não permitido" });
}
