import { useState } from "react";
import Modal from "../common/modal";
import Button from "../common/button";
import { FloatInput } from "../common/field";
import PasswordStrength from "../auth/passwordstrength";
import { adminService } from "../../services/adminservice";
import { errMsg } from "../../services/api";
import { useToast } from "../../context/toastcontext";

/**
 * SetPasswordModal — admin define uma nova senha para um usuário (por e-mail).
 * A senha fica visível para o admin repassar à pessoa.
 * props: { email, open, onClose, onDone() }
 */
export default function SetPasswordModal({ email, open, onClose, onDone }) {
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function close() {
    if (loading) return;
    setPassword("");
    setError("");
    onClose?.();
  }

  async function submit() {
    if (loading) return;
    if (password.length < 6) {
      setError("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await adminService.setPassword(email, password);
      toast.success("Senha definida", email);
      setPassword("");
      onDone?.();
      onClose?.();
    } catch (err) {
      setError(errMsg(err, "Não foi possível definir a senha."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Definir nova senha"
      size="sm"
      actions={
        <>
          <Button variant="ghost" onClick={close} disabled={loading}>Cancelar</Button>
          <Button variant="primary" onClick={submit} loading={loading}>Salvar senha</Button>
        </>
      }
    >
      <p className="text-muted text-sm mb-16" style={{ lineHeight: 1.55 }}>
        Defina uma nova senha para{" "}
        <strong style={{ color: "var(--vazio)" }}>{email}</strong>. Informe essa senha à pessoa —
        ela poderá entrar imediatamente.
      </p>
      <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <FloatInput
          label="Nova senha"
          type="text"
          name="set-user-password"
          autoComplete="off"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="mt-8">
          <PasswordStrength value={password} />
        </div>
        {error && (
          <div className="alert alert-error mt-12" role="alert">
            <span>{error}</span>
          </div>
        )}
      </form>
    </Modal>
  );
}
