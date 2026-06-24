import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, Sparkles, ChevronRight } from "lucide-react";
import { useCommand } from "../../context/commandcontext";

const TITLES = {
  "/app": "Dashboard",
  "/app/generate": "Gerar conteúdo",
  "/app/estudio": "Estúdio de Imagem",
  "/app/history": "Histórico",
  "/app/admin": "Admin",
  "/app/companies/new": "Nova empresa",
};

function titleFor(pathname) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.includes("/companies/")) return "Editar empresa";
  return "Borrão";
}

export default function Topbar({ onMenu }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setOpen } = useCommand();

  return (
    <header className="topbar">
      <button className="hamburger" onClick={onMenu} aria-label="Abrir menu">
        <Menu />
      </button>

      <div className="topbar-crumb">
        <span className="crumb-section mono" style={{ color: "var(--cinza-fraco)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em" }}>
          Borrão
        </span>
        <ChevronRight className="crumb-section" />
        <strong>{titleFor(location.pathname)}</strong>
      </div>

      <div className="topbar-spacer" />

      <button className="cmd-trigger" onClick={() => setOpen(true)}>
        <Search />
        <span className="cmd-trigger-label">Buscar…</span>
        <span className="kbd">⌘K</span>
      </button>

      <button className="btn btn-primary btn-sm" onClick={() => navigate("/app/generate")}>
        <Sparkles size={15} /> Gerar
      </button>
    </header>
  );
}
