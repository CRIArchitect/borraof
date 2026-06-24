import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, LayoutDashboard, Sparkles, Image as ImageIcon, Clock, Settings, Plus, Building2, CornerDownLeft } from "lucide-react";
import { useCommand } from "../../context/commandcontext";
import { useCompanies } from "../../hooks/usecompanies";
import { useAuth } from "../../context/authcontext";
import { COLOR_PALETTE } from "../../util/constants";
import { overlay, scaleIn } from "../../lib/motion";

export default function CommandPalette() {
  const { open, setOpen } = useCommand();
  const { companies } = useCompanies();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);

  const actions = useMemo(() => {
    const nav = [
      { id: "dash", label: "Ir para o Dashboard", icon: LayoutDashboard, group: "Navegar", run: () => navigate("/app") },
      { id: "gen", label: "Gerar conteúdo", icon: Sparkles, group: "Navegar", run: () => navigate("/app/generate") },
      { id: "studio", label: "Estúdio de Imagem", icon: ImageIcon, group: "Navegar", run: () => navigate("/app/estudio") },
      { id: "hist", label: "Histórico", icon: Clock, group: "Navegar", run: () => navigate("/app/history") },
      { id: "new", label: "Nova empresa", icon: Plus, group: "Ações", run: () => navigate("/app/companies/new") },
    ];
    if (isAdmin) nav.push({ id: "admin", label: "Painel Admin", icon: Settings, group: "Navegar", run: () => navigate("/app/admin") });
    const comps = companies.map((c) => ({
      id: `c-${c.id}`, label: c.name, icon: Building2, group: "Empresas",
      color: c.color || COLOR_PALETTE[0], run: () => navigate(`/app/companies/${c.id}/edit`),
    }));
    return [...nav, ...comps];
  }, [companies, isAdmin, navigate]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return actions;
    return actions.filter((a) => a.label.toLowerCase().includes(t));
  }, [q, actions]);

  const groups = useMemo(() => {
    const map = {};
    filtered.forEach((a) => { (map[a.group] ||= []).push(a); });
    return map;
  }, [filtered]);

  useEffect(() => {
    if (open) {
      setQ("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => { setCursor(0); }, [q]);

  const choose = (a) => { a?.run(); setOpen(false); };

  const onKey = (e) => {
    if (e.key === "Escape") return setOpen(false);
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    if (e.key === "Enter") { e.preventDefault(); choose(filtered[cursor]); }
  };

  let runningIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="cmd-overlay" variants={overlay} initial="hidden" animate="show" exit="exit" onClick={() => setOpen(false)}>
          <motion.div
            className="cmd-box"
            variants={scaleIn}
            role="dialog"
            aria-modal="true"
            aria-label="Paleta de comandos"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onKey}
          >
            <div className="cmd-search">
              <Search />
              <input
                ref={inputRef}
                className="cmd-input"
                placeholder="Buscar telas, empresas, ações…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="cmd-list">
              {filtered.length === 0 && <div className="cmd-empty">Nada encontrado para “{q}”.</div>}
              {Object.entries(groups).map(([group, items]) => (
                <div key={group}>
                  <div className="cmd-group-label">{group}</div>
                  {items.map((a) => {
                    runningIndex += 1;
                    const idx = runningIndex;
                    return (
                      <div
                        key={a.id}
                        className={`cmd-item ${idx === cursor ? "active" : ""}`}
                        onMouseEnter={() => setCursor(idx)}
                        onClick={() => choose(a)}
                      >
                        {a.color ? <span className="cmd-dot" style={{ background: a.color }} /> : <a.icon />}
                        <span>{a.label}</span>
                        {idx === cursor && <CornerDownLeft className="cmd-item-sub" />}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="cmd-foot">
              <span><span className="kbd">↑</span><span className="kbd">↓</span> navegar</span>
              <span><span className="kbd">↵</span> abrir</span>
              <span><span className="kbd">esc</span> fechar</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
