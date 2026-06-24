import { supabase } from "../_lib/supabase.js";
import { getUserFromRequest } from "../_lib/jwt.js";
import { applyCors } from "../_lib/cors.js";

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).json({ detail: "Método não permitido" });
  }

  const payload = getUserFromRequest(req);
  if (!payload) {
    return res.status(401).json({ detail: "Não autenticado" });
  }

  const result = await supabase
    .from("users")
    .select("id, name, email, is_admin, is_active")
    .eq("id", payload.id)
    .maybeSingle();

  if (!result.data || !result.data.is_active) {
    return res.status(401).json({ detail: "Usuário inválido" });
  }

  return res.status(200).json(result.data);
}
