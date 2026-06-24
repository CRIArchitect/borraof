import { createContext, useContext, useMemo, useState } from "react";
import { storage } from "../util/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storage.getUser());

  const value = useMemo(() => ({
    user,
    login(data) {
      storage.setUser(data);
      setUser(storage.getUser());
    },
    logout() {
      storage.clearUser();
      setUser(null);
    },
    isAuthenticated: !!user,
    isAdmin: user?.is_admin === true || user?.is_admin === "true",
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
