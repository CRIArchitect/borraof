import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldPlus, ShieldMinus, UserCheck, UserX } from "lucide-react";
import { stagger, item } from "../../lib/motion";
import Button from "../common/button";
import Badge from "../common/badge";
import EmptyState from "../common/emptystate";
import { adminService } from "../../services/adminservice";
import { errMsg } from "../../services/api";
import { useToast } from "../../context/toastcontext";
import { useConfirm } from "../../context/confirmcontext";
import { formatDate } from "../../util/formatdate";

/**
 * UsersTable — manage platform users.
 * props: { users, onUpdate(id, updatedUser) }
 */
export default function UsersTable({ users = [], onUpdate }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [loadingId, setLoadingId] = useState(null);

  async function handleToggleActive(user) {
    setLoadingId(user.id + ":active");
    try {
      const updated = await adminService.toggleUserActive(user.id);
      onUpdate?.(user.id, updated || { ...user, is_active: !user.is_active });
      toast.success(
        updated?.is_active ?? !user.is_active ? "Usuário ativado" : "Usuário desativado",
        user.email
      );
    } catch (err) {
      toast.error("Não foi possível atualizar", errMsg(err));
    } finally {
      setLoadingId(null);
    }
  }

  async function handleToggleAdmin(user) {
    const makingAdmin = !user.is_admin;
    const ok = await confirm({
      title: makingAdmin ? "Tornar administrador?" : "Remover administrador?",
      message: makingAdmin
        ? `${user.name || user.email} terá acesso total à plataforma.`
        : `${user.name || user.email} perderá o acesso administrativo.`,
      confirmLabel: makingAdmin ? "Tornar admin" : "Remover admin",
      danger: !makingAdmin,
    });
    if (!ok) return;

    setLoadingId(user.id + ":admin");
    try {
      const updated = await adminService.toggleUserAdmin(user.id);
      onUpdate?.(user.id, updated || { ...user, is_admin: makingAdmin });
      toast.success(makingAdmin ? "Agora é administrador" : "Admin removido", user.email);
    } catch (err) {
      toast.error("Não foi possível atualizar", errMsg(err));
    } finally {
      setLoadingId(null);
    }
  }

  if (!users.length) {
    return (
      <EmptyState
        symbol="∅"
        title="Nenhum usuário"
        subtitle="Ainda não há usuários cadastrados na plataforma."
      />
    );
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Cadastro</th>
            <th>Status</th>
            <th style={{ textAlign: "right" }}>Ações</th>
          </tr>
        </thead>
        <motion.tbody variants={stagger(0.04)} initial="hidden" animate="show">
          {users.map((user) => {
            const activeBusy = loadingId === user.id + ":active";
            const adminBusy = loadingId === user.id + ":admin";
            return (
              <motion.tr key={user.id} variants={item}>
                <td className="cell-strong">{user.name || "—"}</td>
                <td className="cell-mono">{user.email}</td>
                <td className="cell-mono">{formatDate(user.created_at)}</td>
                <td>
                  <span className="admin-badges">
                    <Badge tone={user.is_active ? "active" : "inactive"}>
                      {user.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                    {user.is_admin && <Badge tone="admin">Admin</Badge>}
                  </span>
                </td>
                <td>
                  <div className="admin-cell-actions">
                    <Button
                      variant={user.is_active ? "ghost" : "secondary"}
                      size="sm"
                      loading={activeBusy}
                      disabled={adminBusy}
                      icon={user.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                      onClick={() => handleToggleActive(user)}
                    >
                      {user.is_active ? "Desativar" : "Ativar"}
                    </Button>
                    <Button
                      variant={user.is_admin ? "danger" : "ghost"}
                      size="sm"
                      loading={adminBusy}
                      disabled={activeBusy}
                      icon={user.is_admin ? <ShieldMinus size={14} /> : <ShieldPlus size={14} />}
                      onClick={() => handleToggleAdmin(user)}
                    >
                      {user.is_admin ? "Remover admin" : "Tornar admin"}
                    </Button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </motion.tbody>
      </table>
    </div>
  );
}
