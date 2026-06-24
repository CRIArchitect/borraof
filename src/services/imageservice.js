import api from "./api";

/**
 * Image generation & editing.
 *
 * Backend contract (plug your AI model here):
 *   POST /image/generate { company_id, prompt, ratio, n, seed }
 *        -> { images: [ { id, url?, seed, ratio, color, prompt } ] }
 *   POST /image/edit { image_id|image, op, ...params }
 *        op: "variations" | "remove-bg" | "outpaint" | "upscale"
 *        -> { images: [ { id, url?, ... } ] }   (variations: many; others: one)
 *
 * In DEMO mode the backend returns descriptors WITHOUT `url` and the
 * frontend renders a branded mock (see lib/imagegen). When a real model
 * is wired, return `url` and everything else stays the same.
 */
export const imageService = {
  async generate(payload) {
    const { data } = await api.post("/image/generate", payload);
    return data;
  },
  async edit(payload) {
    const { data } = await api.post("/image/edit", payload);
    return data;
  },
  async history() {
    const { data } = await api.get("/image/history");
    return data;
  },
};
