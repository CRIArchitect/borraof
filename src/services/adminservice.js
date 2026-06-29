import api from "./api";

// A Vercel só roteia 1 segmento pro catch-all do admin → id/op/table vão na query.
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
    const { data } = await api.patch(`/admin/users?id=${id}&op=toggle-active`);
    return data;
  },

  async toggleUserAdmin(id) {
    const { data } = await api.patch(`/admin/users?id=${id}&op=toggle-admin`);
    return data;
  },

  async setPassword(email, password) {
    const { data } = await api.post("/admin/users?op=set-password", { email, password });
    return data;
  },

  async waitlist() {
    const { data } = await api.get("/admin/waitlist");
    return data;
  },

  async approveWaitlist(id) {
    const { data } = await api.post(`/admin/waitlist?id=${id}&op=approve`);
    return data;
  },

  async rejectWaitlist(id) {
    await api.delete(`/admin/waitlist?id=${id}`);
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
    await api.delete(`/admin/keys?id=${id}`);
  },

  async verifications() {
    const { data } = await api.get("/admin/verifications");
    return data;
  },

  async dbCompanies() {
    const { data } = await api.get("/admin/db?table=companies");
    return data;
  },

  async dbGenerations() {
    const { data } = await api.get("/admin/db?table=generations");
    return data;
  },
};
