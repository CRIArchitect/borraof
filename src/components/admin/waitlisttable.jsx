import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, CheckCheck } from "lucide-react";
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
 * WaitlistTable — approve / reject access requests.
 * props: { entries, onUpdate(id, status) }
 */
const STATUS = {
  pending: { tone: "pending", label: "Pendente" },
  approved: { tone: "active", label: "Aprovado" },
  rejected: { tone: "rejected", label: "Rejeitado" },
};

export default function WaitlistTable({ entries = [], onUpdate }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [loadingId, setLoadingId] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const pending = entries.filter((e) => (e.status || "pending") === "pending");

  async function handleApprove(entry) {
    setLoadingId(entry.id + ":approve");
    try {
      await adminService.approveWaitlist(entry.id);
      onUpdate?.(entry.id, "approved");
      toast.success("Acesso aprovado", entry.email);
    } catch (err) {
      toast.error("Não foi possível aprovar", errMsg(err));
    } finally {
      setLoadingId(null);
    }
  }

  async function handleReject(entry) {
    const ok = await confirm({
      title: "Rejeitar solicitação?",
      message: `${entry.name || entry.email} não receberá acesso à plataforma.`,
      confirmLabel: "Rejeitar",
      danger: true,
    });
    if (!ok) return;

    setLoadingId(entry.id + ":reject");
    try {
      await adminService.rejectWaitlist(entry.id);
      onUpdate?.(entry.id, "rejected");
      toast.success("Solicitação rejeitada", entry.email);
    } catch (err) {
      toast.error("Não foi possível rejeitar", errMsg(err));
    } finally {
      setLoadingId(null);
    }
  }

  async function handleApproveAll() {
    if (!pending.length) return;
    const ok = await confirm({
      title: "Aprovar todos os pendentes?",
      message: `${pending.length} solicitação(ões) serão aprovadas.`,
      confirmLabel: "Aprovar todos",
    });
    if (!ok) return;

    setBulkBusy(true);
    let approved = 0;
    let failed = 0;
    for (const entry of pending) {
      try {
        await adminService.approveWaitlist(entry.id);
        onUpdate?.(entry.id, "approved");
        approved += 1;
      } catch {
        failed += 1;
      }
    }
    setBulkBusy(false);
    if (failed === 0) {
      toast.success("Pendentes aprovados", `${approved} solicitação(ões) aprovadas.`);
    } else if (approved === 0) {
      toast.error("Falha ao aprovar", "Nenhuma solicitação pôde ser aprovada.");
    } else {
      toast.info("Aprovação parcial", `${approved} aprovadas, ${failed} com erro.`);
    }
  }

  return (
    <>
      <div className="admin-panel-head">
        <div>
          <div className="admin-panel-title">Lista de espera</div>
          <div className="admin-panel-sub">
            {pending.length} pendente(s) de {entries.length} total
          </div>
        </div>
        {pending.length > 0 && (
          <Button
            variant="primary"
            size="sm"
            loading={bulkBusy}
            icon={<CheckCheck size={15} />}
            onClick={handleApproveAll}
          >
            Aprovar todos os pendentes
          </Button>
        )}
      </div>

      {!entries.length ? (
        <EmptyState
          symbol="✶"
          title="Lista de espera vazia"
          subtitle="Nenhuma solicitação de acesso no momento."
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
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
                const approveBusy = loadingId === entry.id + ":approve";
                const rejectBusy = loadingId === entry.id + ":reject";
                const isPending = status === "pending";
                return (
                  <motion.tr key={entry.id} variants={item}>
                    <td className="cell-strong">{entry.name || "—"}</td>
                    <td className="cell-mono">{entry.email}</td>
                    <td className="cell-mono">{formatDate(entry.created_at)}</td>
                    <td>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </td>
                    <td>
                      <div className="admin-cell-actions">
                        {isPending ? (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              loading={approveBusy}
                              disabled={rejectBusy || bulkBusy}
                              icon={<Check size={14} />}
                              onClick={() => handleApprove(entry)}
                            >
                              Aprovar
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              loading={rejectBusy}
                              disabled={approveBusy || bulkBusy}
                              icon={<X size={14} />}
                              onClick={() => handleReject(entry)}
                            >
                              Rejeitar
                            </Button>
                          </>
                        ) : (
                          <span className="text-faint text-xs">Sem ações</span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
        </div>
      )}
    </>
  );
}
