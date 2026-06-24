import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { companyService } from "../services/companyservice";
import { errMsg } from "../services/api";

const CompaniesContext = createContext(null);

/**
 * Single source of truth for companies — fetched once for the whole
 * authenticated shell (sidebar + pages share it; no duplicate requests).
 * Exposes optimistic helpers so mutations reflect instantly.
 */
export function CompaniesProvider({ children }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const alive = useRef(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await companyService.list();
      if (alive.current) setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      if (alive.current) setError(errMsg(err, "Erro ao carregar empresas"));
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    reload();
    return () => { alive.current = false; };
  }, [reload]);

  const upsert = useCallback((company) => {
    setCompanies((list) => {
      const i = list.findIndex((c) => String(c.id) === String(company.id));
      if (i === -1) return [...list, company];
      const copy = [...list];
      copy[i] = { ...copy[i], ...company };
      return copy;
    });
  }, []);

  const removeLocal = useCallback((id) => {
    setCompanies((list) => list.filter((c) => String(c.id) !== String(id)));
  }, []);

  return (
    <CompaniesContext.Provider value={{ companies, loading, error, reload, upsert, removeLocal }}>
      {children}
    </CompaniesContext.Provider>
  );
}

export function useCompanies() {
  const ctx = useContext(CompaniesContext);
  if (!ctx) throw new Error("useCompanies precisa de <CompaniesProvider>");
  return ctx;
}
