import { supabase } from "./supabase.js";

export async function downloadAsBuffer(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Falha ao baixar imagem (${r.status})`);
  const buf = await r.arrayBuffer();
  return Buffer.from(buf);
}

export async function uploadBufferToSupabase(buffer, userId, ext = "png") {
  const filename = `${userId}/${crypto.randomUUID()}.${ext}`;
  const upload = await supabase.storage
    .from("generations")
    .upload(filename, buffer, { contentType: `image/${ext}`, upsert: false });
  if (upload.error) throw upload.error;
  const { data } = supabase.storage.from("generations").getPublicUrl(filename);
  return data.publicUrl;
}

export function pickReplicateUrl(output) {
  const first = Array.isArray(output) ? output[0] : output;
  if (first && typeof first.url === "function") return first.url();
  if (typeof first === "string") return first;
  if (first && first.toString) return first.toString();
  throw new Error("Formato inesperado do Replicate");
}
