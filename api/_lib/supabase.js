import { createClient } from "@supabase/supabase-js";

const url = (process.env.SUPABASE_URL || "").trim();
const serviceKey = process.env.SUPABASE_SERVICE_KEY || "";

if (!url || !serviceKey) {
  console.error("[Borrão] SUPABASE_URL ou SUPABASE_SERVICE_KEY ausentes.");
}

// Fallbacks de placeholder evitam que createClient lance no IMPORT quando a env
// falta (o que derrubava a função com FUNCTION_INVOCATION_FAILED). Com as env vars
// presentes, o comportamento é idêntico ao de antes.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  serviceKey || "placeholder-key",
  { auth: { persistSession: false, autoRefreshToken: false } }
);
