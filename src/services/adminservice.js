import api from "./api";

export const adminService = {
  async stats() {
    const { data } = await api.get("/admin/stats");
    return data;
  },

  async users() {
    const { data } = await api.get("/admin/users");
    return data;
  },

  async toggleUserActive(id) {
    const { data } = await api.patch(`/admin/users/${id}/toggle-active`);
    return data;
  },

  async toggleUserAdmin(id) {
    const { data } = await api.patch(`/admin/users/${id}/toggle-admin`);
    return data;
  },

  async waitlist() {
    const { data } = await api.get("/admin/waitlist");
    return data;
  },

  async approveWaitlist(id) {
    const { data } = await api.post(`/admin/waitlist/${id}/approve`);
    return data;
  },

  async rejectWaitlist(id) {
    await api.delete(`/admin/waitlist/${id}`);
  },

  async keys() {
    const { data } = await api.get("/admin/keys");
    return data;
  },

  async createKey(label) {
    const { data } = await api.post("/admin/keys", { label });
    return data;
  },

  async deleteKey(id) {
    await api.delete(`/admin/keys/${id}`);
  },

  async verifications() {
    const { data } = await api.get("/admin/verifications");
    return data;
  },

  async dbCompanies() {
    const { data } = await api.get("/admin/db/companies");
    return data;
  },

  async dbGenerations() {
    const { data } = await api.get("/admin/db/generations");
    return data;
  },
};
