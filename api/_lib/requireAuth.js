import { getUserFromRequest } from "./jwt.js";

export function requireAuth(req, res) {
  const payload = getUserFromRequest(req);
  if (!payload) {
    res.status(401).json({ detail: "Não autenticado" });
    return null;
  }
  return payload;
}
