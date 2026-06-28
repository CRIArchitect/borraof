import bcrypt from "bcryptjs";
import { supabase } from "../_lib/supabase.js";
import { signToken, getUserFromRequest } from "../_lib/jwt.js";
import { applyCors } from "../_lib/cors.js";

// Rota dinâmica: /api/auth/login | /register | /me | /request-access
// Consolidada para respeitar o limite de funções serverless do plano Hobby.
export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  const { action } = req.query;
  switch (action) {
    case "login":
      return login(req, res);
    case "register":
      return register(req, res);
    case "me":
      return me(req, res);
    case "request-access":
      return requestAccess(req, res);
    case "forgot-password":
      return forgotPassword(req, res);
    default:
      return res.status(404).json({ detail: "Rota de autenticação não encontrada" });
  }
}

async function login(req, res) {
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
    return res.status(403).json({ detail: "Sua conta ainda não foi liberada por um administrador." });
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

async function register(req, res) {
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
      is_active: false,
      is_admin: false,
    })
    .select("id, name, email")
    .single();

  if (inserted.error) {
    console.error("[register] insert error", inserted.error);
    return res.status(500).json({ detail: "Erro ao criar conta" });
  }

  // Sem token: a conta nasce inativa e só é liberada quando um admin a ativa.
  return res.status(201).json({
    pending: true,
    name: inserted.data.name,
    email: inserted.data.email,
  });
}

async function me(req, res) {
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

async function requestAccess(req, res) {
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

// Pedido de recuperação de senha: registra na tabela `waitlist` (revisada como
// fila de solicitações) para o admin ver no painel. Não revela se o e-mail existe.
async function forgotPassword(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ detail: "Método não permitido" });
  }

  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ detail: "Email é obrigatório" });
  }

  const cleanEmail = String(email).trim().toLowerCase();

  const existing = await supabase
    .from("waitlist")
    .select("id")
    .eq("email", cleanEmail)
    .eq("status", "pending")
    .maybeSingle();

  if (!existing.data) {
    const insert = await supabase
      .from("waitlist")
      .insert({ name: "Recuperação de senha", email: cleanEmail, status: "pending" });
    if (insert.error) {
      console.error("[forgot-password] error", insert.error);
      return res.status(500).json({ detail: "Erro ao registrar pedido" });
    }
  }

  return res.status(200).json({ ok: true });
}
