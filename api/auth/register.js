import bcrypt from "bcryptjs";
import { supabase } from "../_lib/supabase.js";
import { signToken } from "../_lib/jwt.js";
import { applyCors } from "../_lib/cors.js";

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ detail: "Método não permitido" });
  }

  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ detail: "Nome, email e senha são obrigatórios" });
  }

  if (password.length < 6) {
    return res.status(400).json({ detail: "Senha deve ter ao menos 6 caracteres" });
  }

  const cleanEmail = String(email).trim().toLowerCase();

  const existing = await supabase
    .from("users")
    .select("id")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (existing.data) {
    return res.status(400).json({ detail: "Email já cadastrado" });
  }

  const hash = bcrypt.hashSync(password, 10);

  const inserted = await supabase
    .from("users")
    .insert({
      name: String(name).trim(),
      email: cleanEmail,
      password: hash,
    })
    .select("id, name, email, is_admin")
    .single();

  if (inserted.error) {
    console.error("[register] insert error", inserted.error);
    return res.status(500).json({ detail: "Erro ao criar conta" });
  }

  const user = inserted.data;
  const token = signToken({ id: user.id, email: user.email, is_admin: user.is_admin });

  return res.status(200).json({
    token,
    name: user.name,
    email: user.email,
    is_admin: user.is_admin,
  });
}
