import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authcontext";

/** Declarative route guard. Use adminOnly for admin-restricted routes. */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  if (adminOnly && !isAdmin) return <Navigate to="/app" replace />;

  return children;
}
