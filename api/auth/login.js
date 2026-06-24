import bcrypt from "bcryptjs";
import { supabase } from "../_lib/supabase.js";
import { signToken } from "../_lib/jwt.js";
import { applyCors } from "../_lib/cors.js";

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ detail: "Método não permitido" });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ detail: "Email e senha são obrigatórios" });
  }

  const cleanEmail = String(email).trim().toLowerCase();

  const result = await supabase
    .from("users")
    .select("id, name, email, password, is_admin, is_active")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (result.error) {
    console.error("[login] query error", result.error);
    return res.status(500).json({ detail: "Erro ao buscar usuário" });
  }

  const user = result.data;

  if (!user) {
    return res.status(401).json({ detail: "Email ou senha incorretos" });
  }

  if (!user.is_active) {
    return res.status(403).json({ detail: "Conta desativada" });
  }

  const ok = bcrypt.compareSync(password, user.password);

  if (!ok) {
    return res.status(401).json({ detail: "Email ou senha incorretos" });
  }

  const token = signToken({ id: user.id, email: user.email, is_admin: user.is_admin });

  return res.status(200).json({
    token,
    name: user.name,
    email: user.email,
    is_admin: user.is_admin,
  });
}
