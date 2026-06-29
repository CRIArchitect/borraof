import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Sparkles } from "lucide-react";
import { stagger, item } from "../../lib/motion";
import Skeleton from "../common/skeleton";
import EmptyState from "../common/emptystate";
import Button from "../common/button";
import { adminService } from "../../services/adminservice";
import { errMsg } from "../../services/api";
import { useToast } from "../../context/toastcontext";

/**
 * DbViewer — generic table view over raw DB collections.
 * Sub-toggle between Empresas and Gerações; renders columns from the
 * keys of the first object (defensive for empty / non-array payloads).
 */
const SOURCES = [
  { id: "companies", label: "Empresas", icon: Building2, fetch: () => adminService.dbCompanies() },
  { id: "generations", label: "Gerações", icon: Sparkles, fetch: () => adminService.dbGenerations() },
];

function formatCell(value) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "sim" : "não";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export default function DbViewer() {
  const toast = useToast();
  const [source, setSource] = useState("companies");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function load(id) {
    const def = SOURCES.find((s) => s.id === id) || SOURCES[0];
    setLoading(true);
    setError(false);
    try {
      const data = await def.fetch();
      const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      setRows(list);
    } catch (err) {
      setError(true);
      setRows([]);
      toast.error("Falha ao carregar dados", errMsg(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(source);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  const columns = rows.length && rows[0] && typeof rows[0] === "object" ? Object.keys(rows[0]) : [];

  return (
    <>
      <div className="admin-panel-head">
        <div className="admin-dbviewer-toggle" role="tablist" aria-label="Fonte de dados">
          {SOURCES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={source === id}
              className={`admin-dbviewer-btn${source === id ? " active" : ""}`}
              onClick={() => setSource(id)}
            >
              <Icon size={14} aria-hidden />
              {label}
            </button>
          ))}
        </div>
        {!loading && !error && (
          <span className="admin-db-count">{rows.length} registro(s)</span>
        )}
      </div>

      {loading ? (
        <div className="flex-col gap-12">
          <Skeleton h={40} r={10} />
          <Skeleton h={36} r={10} />
          <Skeleton h={36} r={10} />
          <Skeleton h={36} r={10} />
        </div>
      ) : error ? (
        <EmptyState
          symbol="!"
          title="Erro ao carregar"
          subtitle="Não foi possível obter os dados."
          action={<Button variant="secondary" size="sm" onClick={() => load(source)}>Tentar novamente</Button>}
        />
      ) : !rows.length || !columns.length ? (
        <EmptyState symbol="∅" title="Sem registros" subtitle="Esta coleção está vazia." />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <motion.tbody variants={stagger(0.03)} initial="hidden" animate="show">
              {rows.map((row, i) => (
                <motion.tr key={row?.id ?? i} variants={item}>
                  {columns.map((col) => (
                    <td key={col} className="admin-db-cell" data-label={col} title={formatCell(row?.[col])}>
                      {formatCell(row?.[col])}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      )}
    </>
  );
}
