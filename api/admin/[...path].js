import bcrypt from "bcryptjs";
import { supabase } from "../_lib/supabase.js";
import { getUserFromRequest } from "../_lib/jwt.js";
import { applyCors } from "../_lib/cors.js";

// Rota catch-all de admin: /api/admin/<resource>[/<id>[/<action>]]
// Consolidada numa única função para respeitar o limite do plano Hobby.
// Cobre: stats, users (+toggle-active/toggle-admin), waitlist (+approve/reject),
// keys, verifications, db/companies, db/generations.
export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  const payload = getUserFromRequest(req);
  if (!payload) return res.status(401).json({ detail: "Não autenticado" });

  // Revalida is_admin no banco (o token pode estar desatualizado)
  const me = await supabase.from("users").select("is_admin, is_active").eq("id", payload.id).maybeSingle();
  if (!me.data || !me.data.is_active || !me.data.is_admin) {
    return res.status(403).json({ detail: "Acesso restrito a administradores" });
  }

  // A Vercel nem sempre popula req.query.path no catch-all → derivamos da URL.
  let path = [];
  const raw = req.query.path;
  if (Array.isArray(raw) && raw.length) path = raw;
  else if (typeof raw === "string" && raw) path = raw.split("/").filter(Boolean);
  else {
    let u = (req.url || "").split("?")[0].replace(/^\/+/, "");
    u = u.replace(/^api\//, "").replace(/^admin\/?/, "");
    path = u ? u.split("/").filter(Boolean) : [];
  }
  const [resource, id, action] = path;
  const m = req.method;

  try {
    // ── STATS ──
    if (resource === "stats" && m === "GET") {
      const tables = ["users", "companies", "generations", "waitlist"];
      const c = await Promise.all(tables.map((t) => supabase.from(t).select("*", { count: "exact", head: true })));
      return res.status(200).json({
        users: c[0].count || 0,
        companies: c[1].count || 0,
        generations: c[2].count || 0,
        waitlist: c[3].count || 0,
      });
    }

    // ── USERS ──
    if (resource === "users") {
      if (!id && m === "GET") {
        const r = await supabase.from("users").select("id, name, email, is_admin, is_active, created_at").order("created_at", { ascending: false });
        if (r.error) throw r.error;
        return res.status(200).json(r.data || []);
      }
      if (id === "set-password" && m === "POST") {
        const { email, password } = req.body || {};
        if (!email || !password) return res.status(400).json({ detail: "Email e senha são obrigatórios" });
        if (String(password).length < 6) return res.status(400).json({ detail: "Senha deve ter ao menos 6 caracteres" });
        const cleanEmail = String(email).trim().toLowerCase();
        const target = await supabase.from("users").select("id, email").eq("email", cleanEmail).maybeSingle();
        if (!target.data) return res.status(404).json({ detail: "Usuário não encontrado para este e-mail" });
        const hash = bcrypt.hashSync(String(password), 10);
        const upd = await supabase.from("users").update({ password: hash }).eq("id", target.data.id);
        if (upd.error) throw upd.error;
        return res.status(200).json({ ok: true, email: target.data.email });
      }
      if (id && (action === "toggle-active" || action === "toggle-admin") && m === "PATCH") {
        const col = action === "toggle-active" ? "is_active" : "is_admin";
        const cur = await supabase.from("users").select(`id, ${col}`).eq("id", id).maybeSingle();
        if (!cur.data) return res.status(404).json({ detail: "Usuário não encontrado" });
        const upd = await supabase.from("users").update({ [col]: !cur.data[col] }).eq("id", id)
          .select("id, name, email, is_admin, is_active, created_at").single();
        if (upd.error) throw upd.error;
        return res.status(200).json(upd.data);
      }
    }

    // ── WAITLIST ──
    if (resource === "waitlist") {
      if (!id && m === "GET") {
        const r = await supabase.from("waitlist").select("id, name, email, status, created_at").order("created_at", { ascending: false });
        if (r.error) throw r.error;
        return res.status(200).json(r.data || []);
      }
      if (id && action === "approve" && m === "POST") {
        const r = await supabase.from("waitlist").update({ status: "approved" }).eq("id", id).select("*").single();
        if (r.error) throw r.error;
        return res.status(200).json(r.data);
      }
      if (id && !action && m === "DELETE") {
        const r = await supabase.from("waitlist").delete().eq("id", id);
        if (r.error) throw r.error;
        return res.status(200).json({ ok: true });
      }
    }

    // ── KEYS (defensivo: tabela api_keys pode não existir ainda) ──
    if (resource === "keys") {
      if (!id && m === "GET") {
        const r = await supabase.from("api_keys").select("*").order("created_at", { ascending: false });
        return res.status(200).json(r.error ? [] : r.data || []);
      }
      if (!id && m === "POST") {
        const label = (req.body?.label || "").trim() || "Sem rótulo";
        const value = "brr_live_" + crypto.randomUUID().replace(/-/g, "").slice(0, 24);
        const r = await supabase.from("api_keys").insert({ label, key: value, prefix: value.slice(0, 12) }).select("*").single();
        if (r.error) return res.status(400).json({ detail: "Tabela de chaves (api_keys) não configurada no Supabase." });
        return res.status(200).json(r.data);
      }
      if (id && m === "DELETE") {
        await supabase.from("api_keys").delete().eq("id", id);
        return res.status(200).json({ ok: true });
      }
    }

    // ── VERIFICATIONS (defensivo) ──
    if (resource === "verifications" && m === "GET") {
      const r = await supabase.from("verifications").select("*").order("created_at", { ascending: false });
      return res.status(200).json(r.error ? [] : r.data || []);
    }

    // ── DB VIEWER ──
    if (resource === "db" && m === "GET") {
      const table = id === "generations" ? "generations" : id === "companies" ? "companies" : null;
      if (!table) return res.status(404).json({ detail: "Tabela inválida" });
      const r = await supabase.from(table).select("*").order("created_at", { ascending: false }).limit(100);
      if (r.error) throw r.error;
      return res.status(200).json(r.data || []);
    }

    return res.status(404).json({ detail: `Rota admin desconhecida: /${path.join("/")}`, _u: req.url || null });
  } catch (err) {
    console.error("[admin]", err);
    return res.status(500).json({ detail: "Erro no admin: " + err.message });
  }
}
