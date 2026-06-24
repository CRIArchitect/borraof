import { NavLink, useNavigate, useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Sparkles, Image as ImageIcon, Clock, Settings, Plus, LogOut } from "lucide-react";
import { useAuth } from "../../context/authcontext";
import { useCompanies } from "../../hooks/usecompanies";
import { COLOR_PALETTE } from "../../util/constants";

const NAV = [
  { to: "/app", end: true, label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/generate", label: "Gerar conteúdo", icon: Sparkles },
  { to: "/app/estudio", label: "Estúdio de Imagem", icon: ImageIcon },
  { to: "/app/history", label: "Histórico", icon: Clock },
];

export default function Sidebar({ onNavigate, open = false }) {
  const { user, logout, isAdmin } = useAuth();
  const { companies } = useCompanies();
  const navigate = useNavigate();
  const { id: activeCompanyId } = useParams();
  const location = useLocation();

  const go = (to) => { navigate(to); onNavigate?.(); };
  const initial = (user?.name || user?.email || "B").trim().charAt(0).toUpperCase();

  return (
    <aside className={`sidebar ${open ? "open" : ""}`} aria-label="Navegação principal">
      <div className="sidebar-logo">
        <span className="sidebar-logo-text">Borr<span className="fogo">ã</span>o</span>
        <span className="sidebar-logo-sub">by CRÏΔ</span>
      </div>

      <div className="sidebar-body">
        <div className="sidebar-section">
          <span>Empresas</span>
          <span className="mono" style={{ color: "var(--cinza-fraco)" }}>{companies.length}</span>
        </div>

        {companies.map((c) => {
          const active = String(c.id) === String(activeCompanyId);
          return (
            <button
              key={c.id}
              className={`sidebar-company-item ${active ? "active" : ""}`}
              onClick={() => go(`/app/companies/${c.id}/edit`)}
            >
              {active && <motion.span layoutId="company-bar" className="sidebar-active-bar" />}
              <span
                className="sidebar-company-dot"
                style={{ background: c.color || COLOR_PALETTE[0], color: c.color || COLOR_PALETTE[0] }}
              />
              <span className="sidebar-company-name">{c.name}</span>
            </button>
          );
        })}

        <button className="sidebar-add-btn" onClick={() => go("/app/companies/new")}>
          <Plus /> Nova empresa
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ to, end, label, icon: Icon }) => {
          const active = end ? location.pathname === to : location.pathname.startsWith(to);
          return (
            <NavLink key={to} to={to} end={end} onClick={onNavigate} className="sidebar-nav-item">
              {active && <motion.span layoutId="nav-glow" className="sidebar-nav-glow" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <Icon /> {label}
            </NavLink>
          );
        })}
        {isAdmin && (
          <NavLink to="/app/admin" onClick={onNavigate} className="sidebar-nav-item">
            {location.pathname.startsWith("/app/admin") && (
              <motion.span layoutId="nav-glow" className="sidebar-nav-glow" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
            )}
            <Settings /> Admin
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-avatar">{initial}</div>
        <div className="sidebar-user">
          <div className="sidebar-user-name">{user?.name || user?.email}</div>
          <div className="sidebar-user-role">{isAdmin ? "Administrador" : "Membro"}</div>
        </div>
        <button className="sidebar-logout tip" data-tip="Sair" onClick={logout} aria-label="Sair">
          <LogOut />
        </button>
      </div>
    </aside>
  );
}
