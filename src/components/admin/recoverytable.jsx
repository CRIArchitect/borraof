import { useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, X } from "lucide-react";
import { stagger, item } from "../../lib/motion";
import Button from "../common/button";
import Badge from "../common/badge";
import EmptyState from "../common/emptystate";
import SetPasswordModal from "./setpasswordmodal";
import { adminService } from "../../services/adminservice";
import { errMsg } from "../../services/api";
import { useToast } from "../../context/toastcontext";
import { useConfirm } from "../../context/confirmcontext";
import { formatDate } from "../../util/formatdate";

/**
 * RecoveryTable — pedidos de recuperação de senha.
 * Reaproveita a tabela `waitlist` (agora dedicada a solicitações).
 * props: { entries, onUpdate(id, status, remove?) }
 */
const STATUS = {
  pending: { tone: "pending", label: "Pendente" },
  approved: { tone: "active", label: "Resolvido" },
};

export default function RecoveryTable({ entries = [], onUpdate }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [loadingId, setLoadingId] = useState(null);
  const [pwEntry, setPwEntry] = useState(null);

  const pending = entries.filter((e) => (e.status || "pending") === "pending");

  async function resolve(entry) {
    try {
      await adminService.approveWaitlist(entry.id);
      onUpdate?.(entry.id, "approved");
    } catch (err) {
      toast.error("Senha definida, mas não consegui marcar como resolvido", errMsg(err));
    }
  }

  async function handleDismiss(entry) {
    const ok = await confirm({
      title: "Descartar pedido?",
      message: `O pedido de ${entry.email} será removido da lista.`,
      confirmLabel: "Descartar",
      danger: true,
    });
    if (!ok) return;
    setLoadingId(entry.id + ":dismiss");
    try {
      await adminService.rejectWaitlist(entry.id);
      onUpdate?.(entry.id, "rejected", true);
      toast.success("Pedido descartado", entry.email);
    } catch (err) {
      toast.error("Não foi possível remover", errMsg(err));
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <>
      <div className="admin-panel-head">
        <div>
          <div className="admin-panel-title">Recuperação de senha</div>
          <div className="admin-panel-sub">
            {pending.length} pendente(s) de {entries.length} pedido(s)
          </div>
        </div>
      </div>

      {!entries.length ? (
        <EmptyState
          symbol="Δ"
          title="Nenhum pedido"
          subtitle="Nenhuma solicitação de recuperação de senha no momento."
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>E-mail</th>
                <th>Solicitado</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <motion.tbody variants={stagger(0.04)} initial="hidden" animate="show">
              {entries.map((entry) => {
                const status = entry.status || "pending";
                const meta = STATUS[status] || STATUS.pending;
                const dismissBusy = loadingId === entry.id + ":dismiss";
                const isPending = status === "pending";
                return (
                  <motion.tr key={entry.id} variants={item}>
                    <td className="cell-mono" data-label="E-mail">{entry.email}</td>
                    <td className="cell-mono" data-label="Solicitado">{formatDate(entry.created_at)}</td>
                    <td data-label="Status">
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </td>
                    <td data-label="Ações">
                      <div className="admin-cell-actions">
                        {isPending && (
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={dismissBusy}
                            icon={<KeyRound size={14} />}
                            onClick={() => setPwEntry(entry)}
                          >
                            Definir senha
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          loading={dismissBusy}
                          icon={<X size={14} />}
                          onClick={() => handleDismiss(entry)}
                        >
                          Descartar
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
        </div>
      )}

      <SetPasswordModal
        open={!!pwEntry}
        email={pwEntry?.email}
        onClose={() => setPwEntry(null)}
        onDone={() => pwEntry && resolve(pwEntry)}
      />
    </>
  );
}
