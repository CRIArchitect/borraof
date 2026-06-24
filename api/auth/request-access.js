import { supabase } from "../_lib/supabase.js";
import { applyCors } from "../_lib/cors.js";

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ detail: "Método não permitido" });
  }

  const { name, email } = req.body || {};

  if (!email) {
    return res.status(400).json({ detail: "Email é obrigatório" });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanName = name ? String(name).trim() : "Sem nome";

  const existing = await supabase
    .from("waitlist")
    .select("id")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (existing.data) {
    return res.status(200).json({ ok: true, message: "Já está na lista" });
  }

  const insert = await supabase
    .from("waitlist")
    .insert({ name: cleanName, email: cleanEmail, status: "pending" });

  if (insert.error) {
    console.error("[request-access] error", insert.error);
    return res.status(500).json({ detail: "Erro ao registrar" });
  }

  return res.status(200).json({ ok: true });
}
