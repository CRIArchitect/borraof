import api from "./api";

export const authService = {
  async login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },

  async register(email, name, password) {
    const { data } = await api.post("/auth/register", { email, name, password });
    return data;
  },

  async requestAccess(email, name) {
    const { data } = await api.post("/auth/request-access", { email, name });
    return data;
  },

  async forgotPassword(email) {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  },
};
