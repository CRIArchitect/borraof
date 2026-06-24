import api from "./api";

export const companyService = {
  async list() {
    const { data } = await api.get("/companies");
    return data;
  },

  async get(id) {
    const { data } = await api.get(`/companies/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await api.post("/companies", payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/companies/${id}`, payload);
    return data;
  },

  async remove(id) {
    await api.delete(`/companies/${id}`);
  },
};
