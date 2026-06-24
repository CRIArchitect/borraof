export const storage = {
  get: (key) => localStorage.getItem(key),
  set: (key, val) => localStorage.setItem(key, String(val)),
  remove: (key) => localStorage.removeItem(key),
  clear: () => localStorage.clear(),

  getUser() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return {
      token,
      name: localStorage.getItem("name") || "",
      email: localStorage.getItem("email") || "",
      is_admin: localStorage.getItem("is_admin") === "true",
    };
  },

  setUser(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("name", data.name || "");
    localStorage.setItem("email", data.email || "");
    localStorage.setItem("is_admin", String(data.is_admin || false));
  },

  clearUser() {
    ["token", "name", "email", "is_admin"].forEach(k => localStorage.removeItem(k));
  },
};
