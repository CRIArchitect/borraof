import api from "./api";

export const generationService = {
  async generate(payload) {
    // payload: { company_id, type, brief, month?, year? }
    const { data } = await api.post("/generate", payload);
    return data;
  },

  async history() {
    const { data } = await api.get("/history");
    return data;
  },

  async get(id) {
    const { data } = await api.get(`/history/${id}`);
    return data;
  },
};
