import { useCallback, useEffect, useRef, useState } from "react";
import { generationService } from "../services/generationservice";
import { errMsg } from "../services/api";

export function useGenerations() {
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const alive = useRef(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generationService.history();
      if (alive.current) setGenerations(Array.isArray(data) ? data : []);
    } catch (err) {
      if (alive.current) setError(errMsg(err, "Erro ao carregar histórico"));
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    reload();
    return () => { alive.current = false; };
  }, [reload]);

  return { generations, loading, error, reload };
}
