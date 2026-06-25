import api from "./api";

export const imageService = {
  async generate(companyId, brief) {
    const { data } = await api.post("/image/generate", { company_id: companyId, brief });
    return data;
  },

  async variations(prompt, companyId) {
    const { data } = await api.post("/image/variations", { prompt, company_id: companyId });
    return data;
  },

  async removeBg(imageUrl, companyId) {
    const { data } = await api.post("/image/remove-bg", { image_url: imageUrl, company_id: companyId });
    return data;
  },

  async outpaint(imageUrl, direction, companyId) {
    const { data } = await api.post("/image/outpaint", { image_url: imageUrl, direction, company_id: companyId });
    return data;
  },
};
