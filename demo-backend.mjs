// Backend de DEMONSTRAÇÃO (sem deps) para testar o Borrão sem o FastAPI real.
// Aceita qualquer login e entra como admin. Rodar: node demo-backend.mjs
import { createServer } from "http";

const companies = [
  { id: 1, name: "Padaria do João", segment: "Alimentação", audience: "Famílias do bairro, 25-55", city: "São Paulo", tone: "Descontraído", extra: "Principal produto: pão na chapa. Linguagem calorosa.", color: "#FFB347" },
  { id: 2, name: "Studio Lumière", segment: "Estética & Beleza", audience: "Mulheres 28-45, classe A/B", city: "Campinas", tone: "Inspiracional", extra: "Foco em autoestima e bem-estar.", color: "#C77DFF" },
  { id: 3, name: "TechNova", segment: "SaaS B2B", audience: "Gestores de PMEs", city: "Curitiba", tone: "Profissional", extra: "Produto: ERP na nuvem.", color: "#74C0FC" },
  { id: 4, name: "Verde Vida", segment: "Saúde & Suplementos", audience: "Praticantes de atividade física", city: "Belo Horizonte", tone: "Educativo", extra: "", color: "#69DB7C" },
];

const now = Date.now();
const gens = [
  { id: 11, company_name: "Padaria do João", type: "legenda", brief: "Promoção de café da manhã no fim de semana", result: "☕ Bom dia começa aqui!\n\nNada como o cheirinho de pão quentinho saindo do forno...\n\nNeste fim de semana: combo café + pão na chapa por R$ 9,90. Te esperamos! 🥐", created_at: new Date(now - 3600e3).toISOString() },
  { id: 12, company_name: "Studio Lumière", type: "copy", brief: "Lançamento do novo protocolo de skincare", result: "Sua pele merece um ritual.\n\nApresentamos o Protocolo Lumière: 4 etapas para uma pele radiante e renovada...", created_at: new Date(now - 8 * 3600e3).toISOString() },
  { id: 13, company_name: "TechNova", type: "email", brief: "Reativar leads que abandonaram o trial", result: "Assunto: Seu ERP ainda está te esperando 👀\n\nOlá! Notamos que você começou a explorar a TechNova...", created_at: new Date(now - 26 * 3600e3).toISOString() },
  { id: 14, company_name: "Padaria do João", type: "roteiro", brief: "Reels mostrando os bastidores da produção", result: "CENA 1 (0-3s): Mãos sovando a massa em câmera lenta.\nCENA 2 (3-7s): Forno abrindo, vapor subindo...", created_at: new Date(now - 50 * 3600e3).toISOString() },
  { id: 15, company_name: "Verde Vida", type: "ideia", brief: "Conteúdo educativo sobre proteína", result: "1. Mito x Verdade: quanto de proteína você realmente precisa?\n2. Série 'Prato da semana'...", created_at: new Date(now - 80 * 3600e3).toISOString() },
];

const users = [
  { id: 1, name: "Márcio Bastos", email: "marcio@grupobmz.com.br", created_at: "2026-01-12", is_active: true, is_admin: true },
  { id: 2, name: "Ana Ferreira", email: "ana@grupobmz.com.br", created_at: "2026-03-02", is_active: true, is_admin: false },
  { id: 3, name: "Lucas Prado", email: "lucas@cliente.com", created_at: "2026-04-18", is_active: false, is_admin: false },
];
const waitlist = [
  { id: 1, name: "Beatriz Lima", email: "bia@startup.io", created_at: "2026-06-10", status: "pending" },
  { id: 2, name: "Rafael Souza", email: "rafa@agencia.com", created_at: "2026-06-15", status: "pending" },
  { id: 3, name: "Carla Mendes", email: "carla@loja.com", created_at: "2026-05-28", status: "approved" },
];
const keys = [
  { id: 1, label: "Produção", prefix: "brr_live_a1b2", created_at: "2026-02-01" },
  { id: 2, label: "Testes", prefix: "brr_test_9z8y", created_at: "2026-04-22" },
];

const send = (res, code, body) => {
  res.writeHead(code, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
  });
  res.end(JSON.stringify(body));
};
const readBody = (req) => new Promise((resolve) => {
  let d = ""; req.on("data", (c) => (d += c)); req.on("end", () => { try { resolve(JSON.parse(d || "{}")); } catch { resolve({}); } });
});

const nameFromEmail = (email) => {
  const u = (email || "demo").split("@")[0].replace(/[._-]/g, " ");
  return u.replace(/\b\w/g, (c) => c.toUpperCase());
};

createServer(async (req, res) => {
  try {
    const { method } = req;
    const path = (req.url || "/").split("?")[0];
    if (method === "OPTIONS") return send(res, 204, {});
    console.log(method, path);

    // ── Auth (demo: aceita qualquer credencial, entra como admin) ──
    if (path === "/auth/login" && method === "POST") {
      const b = await readBody(req);
      return send(res, 200, { token: "demo-token-" + Date.now(), name: nameFromEmail(b.email), email: b.email || "demo@borrao.app", is_admin: true });
    }
    if (path === "/auth/request-access") return send(res, 200, { ok: true });
    if (path === "/auth/verify") return send(res, 200, { ok: true });
    if (path === "/auth/register") return send(res, 200, { ok: true });

    if (path === "/companies" && method === "GET") return send(res, 200, companies);
    if (/^\/companies\/\d+$/.test(path) && method === "GET") return send(res, 200, companies.find((c) => c.id === +path.split("/")[2]) || companies[0]);
    if (path === "/companies" && method === "POST") { const b = await readBody(req); return send(res, 200, { id: 99, ...b }); }
    if (/^\/companies\/\d+$/.test(path)) return send(res, 200, { id: +path.split("/")[2] });

    if (path === "/history" && method === "GET") return send(res, 200, gens);
    if (/^\/history\/\d+$/.test(path)) return send(res, 200, gens.find((g) => g.id === +path.split("/")[2]) || gens[0]);
    if (path === "/generate" && method === "POST") {
      const b = await readBody(req);
      const co = companies.find((c) => String(c.id) === String(b.company_id));
      const cn = co?.name || "sua marca";
      const tone = co?.tone ? ` (tom ${co.tone.toLowerCase()})` : "";
      const brief = (b.brief || "").trim() || "o tema do briefing";
      const tag = "#" + cn.replace(/\s+/g, "");
      const T = {
        roteiro: `🎬 ROTEIRO — ${cn}${tone}\n\nGANCHO (0-3s): abertura impactante sobre "${brief}".\nDESENVOLVIMENTO (3-15s): 2 cenas mostrando a solução da ${cn}.\nVIRADA (15-22s): prova/benefício concreto.\nCTA (22-25s): chamada direta para ação.`,
        copy: `✍️ COPY — ${cn}${tone}\n\nVocê já parou pra pensar em ${brief}?\n\nNa ${cn}, a gente transforma isso em resultado — sem complicação.\n\n👉 Garanta já o seu. ${tag}`,
        ideia: `💡 5 IDEIAS — ${cn}\n\n1. Carrossel "${brief}" em 5 passos\n2. Reels de bastidores\n3. Enquete nos stories sobre o tema\n4. Depoimento de cliente real\n5. Antes & depois`,
        legenda: `📸 LEGENDA — ${cn}\n\n${brief} ✨\n\nArrasta pro lado pra descobrir como a ${cn} pode te ajudar 👉\n\n${tag} #conteudo #marketing`,
        email: `📧 E-MAIL — ${cn}\n\nAssunto: ${brief} — você não vai querer perder\n\nOlá! Preparamos algo especial sobre ${brief}. Em 1 minuto de leitura você descobre como a ${cn} resolve isso.\n\n[Quero saber mais →]`,
        cta: `🎯 CTAs — ${cn}\n\n• Comece agora com a ${cn}\n• Fale com um especialista\n• Garanta sua vaga (vagas limitadas)\n• Aproveite enquanto dura`,
      };
      const result = T[b.type] || T.copy;
      return setTimeout(() => send(res, 200, { result }), 1100);
    }

    // ── Imagem (demo: devolve descritores; o front renderiza o mock de marca) ──
    if (path === "/image/generate" && method === "POST") {
      const b = await readBody(req);
      const co = companies.find((c) => String(c.id) === String(b.company_id));
      const color = co?.color || "#FC4B08";
      const n = Math.min(Math.max(parseInt(b.n) || 4, 1), 6);
      const base = parseInt(b.seed) || Math.floor(Date.now() % 100000);
      const images = Array.from({ length: n }, (_, i) => ({
        id: base + i, seed: base + i * 977, ratio: b.ratio || "1:1", color, prompt: b.prompt || "",
      }));
      return setTimeout(() => send(res, 200, { images }), 1500);
    }
    if (path === "/image/edit" && method === "POST") {
      const b = await readBody(req);
      const color = b.color || "#FC4B08";
      const ratio = b.ratio || "1:1";
      const s = parseInt(b.seed) || 1;
      let images;
      if (b.op === "variations") {
        images = Array.from({ length: 3 }, (_, i) => ({ id: Date.now() + i, seed: s + (i + 1) * 5113, ratio, color, prompt: b.prompt || "" }));
      } else if (b.op === "remove-bg") {
        images = [{ id: Date.now(), seed: s, ratio, color, prompt: b.prompt || "", transparent: true }];
      } else if (b.op === "outpaint") {
        images = [{ id: Date.now(), seed: s, ratio: "16:9", color, prompt: b.prompt || "", expanded: true }];
      } else { // upscale
        images = [{ id: Date.now(), seed: s, ratio, color, prompt: b.prompt || "", upscaled: true }];
      }
      return setTimeout(() => send(res, 200, { images }), 1200);
    }
    if (path === "/image/history") return send(res, 200, []);

    if (path === "/admin/stats") return send(res, 200, { users: 128, companies: 64, generations: 1432, waitlist: 12 });
    if (path === "/admin/users") return send(res, 200, users);
    if (path === "/admin/waitlist") return send(res, 200, waitlist);
    if (path === "/admin/keys" && method === "GET") return send(res, 200, keys);
    if (path === "/admin/keys" && method === "POST") { const b = await readBody(req); return send(res, 200, { id: Date.now(), label: b.label || "Nova", key: "brr_live_" + Math.random().toString(36).slice(2, 14), prefix: "brr_live", created_at: new Date().toISOString() }); }
    if (path === "/admin/db/companies") return send(res, 200, companies);
    if (path === "/admin/db/generations") return send(res, 200, gens);
    if (path === "/admin/verifications") return send(res, 200, []);
    if (path.startsWith("/admin/")) return send(res, 200, { ok: true, is_admin: true, is_active: true, status: "approved" });

    return send(res, 200, { ok: true });
  } catch (e) {
    try { send(res, 500, { detail: String(e) }); } catch {}
  }
}).listen(8000, () => console.log("✅ Borrão demo backend ouvindo em http://localhost:8000"));
