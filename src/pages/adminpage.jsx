import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, Users, Clock, KeyRound, Database } from "lucide-react";
import PageHeader from "../components/layout/pageheader";
import Skeleton from "../components/common/skeleton";
import AdminTabs from "../components/admin/admintabs";
import AdminStats from "../components/admin/adminstats";
import UsersTable from "../components/admin/userstable";
import WaitlistTable from "../components/admin/waitlisttable";
import KeysTable from "../components/admin/keystable";
import DbViewer from "../components/admin/dbviewer";
import { adminService } from "../services/adminservice";
import { errMsg } from "../services/api";
import { useToast } from "../context/toastcontext";
import { blurIn } from "../lib/motion";

const TABS = [
  { id: "overview", label: "Visão geral", icon: LayoutGrid },
  { id: "users", label: "Usuários", icon: Users },
  { id: "waitlist", label: "Waitlist", icon: Clock },
  { id: "keys", label: "Chaves", icon: KeyRound },
  { id: "data", label: "Dados", icon: Database },
];

export default function AdminPage() {
  const toast = useToast();
  const [tab, setTab] = useState("overview");

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const [s, u, w] = await Promise.allSettled([
        adminService.stats(),
        adminService.users(),
        adminService.waitlist(),
      ]);
      if (!alive) return;

      if (s.status === "fulfilled") {
        setStats(s.value || null);
      } else {
        toast.error("Falha ao carregar estatísticas", errMsg(s.reason));
      }

      if (u.status === "fulfilled") {
        setUsers(Array.isArray(u.value) ? u.value : u.value?.users || []);
      } else {
        toast.error("Falha ao carregar usuários", errMsg(u.reason));
      }

      if (w.status === "fulfilled") {
        setWaitlist(Array.isArray(w.value) ? w.value : w.value?.waitlist || []);
      } else {
        toast.error("Falha ao carregar waitlist", errMsg(w.reason));
      }

      setLoading(false);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateUser(id, updated) {
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, ...updated } : u)));
  }

  function updateWaitlist(id, status) {
    setWaitlist((list) => list.map((e) => (e.id === id ? { ...e, status } : e)));
  }

  const pendingCount = waitlist.filter((e) => (e.status || "pending") === "pending").length;
  const resolvedStats = stats || {
    users: users.length,
    waitlist: waitlist.length,
  };

  return (
    <div className="admin-page">
      <PageHeader eyebrow="Plataforma" title="Admin" subtitle="Gestão de usuários, acesso e dados." />

      {loading ? (
        <>
          <div className="admin-skel-grid">
            <Skeleton h={104} r={16} />
            <Skeleton h={104} r={16} />
            <Skeleton h={104} r={16} />
            <Skeleton h={104} r={16} />
          </div>
          <Skeleton h={48} r={999} />
          <div className="admin-loading">
            <Skeleton h={44} r={12} />
            <Skeleton h={44} r={12} />
            <Skeleton h={44} r={12} />
          </div>
        </>
      ) : (
        <>
          <AdminStats stats={resolvedStats} />

          <AdminTabs tabs={TABS} active={tab} onChange={setTab} />

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              variants={blurIn}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              {tab === "overview" && (
                <div className="admin-overview">
                  <div className="admin-overview-card">
                    <h4>Usuários</h4>
                    <p>
                      <strong>{users.length}</strong> cadastrados ·{" "}
                      {users.filter((u) => u.is_active).length} ativos ·{" "}
                      {users.filter((u) => u.is_admin).length} admins
                    </p>
                  </div>
                  <div className="admin-overview-card">
                    <h4>Lista de espera</h4>
                    <p>
                      <strong>{pendingCount}</strong> pendente(s) de {waitlist.length} solicitação(ões)
                    </p>
                  </div>
                  <div className="admin-overview-card">
                    <h4>Conteúdo gerado</h4>
                    <p>
                      <strong>{Number(stats?.generations) || 0}</strong> gerações na plataforma
                    </p>
                  </div>
                  <div className="admin-overview-card">
                    <h4>Empresas</h4>
                    <p>
                      <strong>{Number(stats?.companies) || 0}</strong> marcas cadastradas
                    </p>
                  </div>
                </div>
              )}

              {tab === "users" && (
                <div className="admin-panel">
                  <div className="admin-panel-head">
                    <div>
                      <div className="admin-panel-title">Usuários</div>
                      <div className="admin-panel-sub">{users.length} cadastrado(s)</div>
                    </div>
                  </div>
                  <UsersTable users={users} onUpdate={updateUser} />
                </div>
              )}

              {tab === "waitlist" && (
                <div className="admin-panel">
                  <WaitlistTable entries={waitlist} onUpdate={updateWaitlist} />
                </div>
              )}

              {tab === "keys" && (
                <div className="admin-panel">
                  <KeysTable />
                </div>
              )}

              {tab === "data" && (
                <div className="admin-panel">
                  <DbViewer />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
