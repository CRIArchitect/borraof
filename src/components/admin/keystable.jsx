import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, KeyRound, Copy, Check } from "lucide-react";
import { stagger, item } from "../../lib/motion";
import Button from "../common/button";
import IconButton from "../common/iconbutton";
import Modal from "../common/modal";
import Skeleton from "../common/skeleton";
import EmptyState from "../common/emptystate";
import { Input } from "../common/field";
import { adminService } from "../../services/adminservice";
import { errMsg } from "../../services/api";
import { useToast } from "../../context/toastcontext";
import { useConfirm } from "../../context/confirmcontext";
import { formatDate } from "../../util/formatdate";

/**
 * KeysTable — manage API keys.
 * Loads keys on mount; create opens a modal and surfaces the secret once.
 */
export default function KeysTable() {
  const toast = useToast();
  const confirm = useConfirm();

  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdSecret, setCreatedSecret] = useState(null);
  const [copied, setCopied] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const data = await adminService.keys();
      setKeys(Array.isArray(data) ? data : data?.keys || []);
    } catch (err) {
      setError(true);
      toast.error("Falha ao carregar chaves", errMsg(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openModal() {
    setLabel("");
    setCreatedSecret(null);
    setCopied(false);
    setModalOpen(true);
  }

  async function handleCreate(e) {
    e?.preventDefault?.();
    const trimmed = label.trim();
    if (!trimmed) {
      toast.error("Informe um rótulo", "A chave precisa de um nome para identificação.");
      return;
    }
    setCreating(true);
    try {
      const created = await adminService.createKey(trimmed);
      const secret = created?.key || created?.secret || created?.token || null;
      setCreatedSecret(secret);
      await load();
      toast.success("Chave criada", trimmed);
      if (!secret) setModalOpen(false);
    } catch (err) {
      toast.error("Não foi possível criar", errMsg(err));
    } finally {
      setCreating(false);
    }
  }

  async function copySecret() {
    if (!createdSecret) return;
    try {
      await navigator.clipboard.writeText(createdSecret);
      setCopied(true);
      toast.success("Copiada", "A chave foi copiada para a área de transferência.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar", "Copie manualmente o valor exibido.");
    }
  }

  async function handleDelete(key) {
    const ok = await confirm({
      title: "Excluir chave?",
      message: `A chave "${key.label || key.prefix || key.id}" deixará de funcionar imediatamente.`,
      confirmLabel: "Excluir",
      danger: true,
    });
    if (!ok) return;

    setDeletingId(key.id);
    try {
      await adminService.deleteKey(key.id);
      await load();
      toast.success("Chave excluída", key.label || undefined);
    } catch (err) {
      toast.error("Não foi possível excluir", errMsg(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="admin-panel-head">
        <div>
          <div className="admin-panel-title">Chaves de API</div>
          <div className="admin-panel-sub">Credenciais de integração da plataforma.</div>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={15} />} onClick={openModal}>
          Nova chave
        </Button>
      </div>

      {loading ? (
        <div className="flex-col gap-12">
          <Skeleton h={44} r={12} />
          <Skeleton h={44} r={12} />
          <Skeleton h={44} r={12} />
        </div>
      ) : error ? (
        <EmptyState
          symbol="!"
          title="Erro ao carregar"
          subtitle="Não foi possível obter as chaves."
          action={<Button variant="secondary" size="sm" onClick={load}>Tentar novamente</Button>}
        />
      ) : !keys.length ? (
        <EmptyState
          symbol="⚷"
          title="Nenhuma chave"
          subtitle="Crie sua primeira chave de API para integrar a plataforma."
          action={<Button variant="primary" size="sm" icon={<Plus size={15} />} onClick={openModal}>Nova chave</Button>}
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Rótulo</th>
                <th>Prefixo</th>
                <th>Criada</th>
                <th style={{ textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <motion.tbody variants={stagger(0.04)} initial="hidden" animate="show">
              {keys.map((key) => (
                <motion.tr key={key.id} variants={item}>
                  <td className="cell-strong">
                    <span className="flex items-center gap-8">
                      <KeyRound size={14} className="text-fogo" aria-hidden />
                      {key.label || "—"}
                    </span>
                  </td>
                  <td>
                    <span className="admin-key-prefix">
                      {key.prefix || (key.key ? `${String(key.key).slice(0, 8)}…` : "—")}
                    </span>
                  </td>
                  <td className="cell-mono">{formatDate(key.created_at)}</td>
                  <td>
                    <div className="admin-cell-actions">
                      <IconButton
                        label="Excluir chave"
                        onClick={() => handleDelete(key)}
                        disabled={deletingId === key.id}
                      >
                        {deletingId === key.id ? (
                          <span className="spinner" aria-hidden />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </IconButton>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={createdSecret ? "Chave criada" : "Nova chave de API"}
        size="md"
        actions={
          createdSecret ? (
            <Button variant="primary" onClick={() => setModalOpen(false)}>Concluir</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={creating}>
                Cancelar
              </Button>
              <Button variant="primary" loading={creating} onClick={handleCreate}>
                Criar chave
              </Button>
            </>
          )
        }
      >
        {createdSecret ? (
          <div>
            <p className="text-sm text-muted">
              Copie esta chave agora. Por segurança, ela não será exibida novamente.
            </p>
            <div className="admin-key-secret">
              <code className="mono">{createdSecret}</code>
              <IconButton label="Copiar chave" onClick={copySecret}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </IconButton>
            </div>
            <p className="admin-key-hint">Guarde-a em local seguro.</p>
          </div>
        ) : (
          <form onSubmit={handleCreate}>
            <Input
              label="Rótulo da chave"
              hint="Um nome para identificar onde a chave será usada."
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex.: Integração Zapier"
              autoFocus
            />
          </form>
        )}
      </Modal>
    </>
  );
}
