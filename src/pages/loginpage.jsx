import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

import AuthShell from "../components/auth/authshell";
import Button from "../components/common/button";
import { FloatInput } from "../components/common/field";
import { useAuth } from "../context/authcontext";
import { useToast } from "../context/toastcontext";
import { authService } from "../services/authservice";
import { errMsg } from "../services/api";
import { ease } from "../lib/motion";

const linkBtn = { background: "none", border: "none", cursor: "pointer", font: "inherit", padding: 0 };

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAuth();
  const toast = useToast();

  const [mode, setMode] = useState("login"); // login | forgot | sent
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const justRegistered = params.get("registered") === "1";

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const data = await authService.login(email.trim(), password);
      login(data);
      toast.success("Bem-vindo de volta", "Tudo nítido por aqui.");
      const nextRaw = params.get("next");
      const next = nextRaw ? decodeURIComponent(nextRaw) : (data.is_admin ? "/app/admin" : "/app");
      navigate(next, { replace: true });
    } catch (err) {
      setError(errMsg(err, "Não foi possível entrar. Verifique seus dados."));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setMode("sent");
    } catch (err) {
      setError(errMsg(err, "Não foi possível enviar o pedido."));
    } finally {
      setLoading(false);
    }
  }

  // ── Pedido enviado ──
  if (mode === "sent") {
    return (
      <AuthShell>
        <div className="waitlist">
          <span className="waitlist-glyph" aria-hidden>Δ</span>
          <h1 className="waitlist-title">Pedido recebido</h1>
          <p className="waitlist-text">
            Em torno de <strong>1 hora</strong> você receberá um e-mail com sua senha.
            O administrador já foi notificado.
          </p>
          <button
            type="button"
            className="auth-back"
            onClick={() => { setMode("login"); setError(""); setPassword(""); }}
          >
            <ArrowLeft aria-hidden />
            Voltar ao login
          </button>
        </div>
      </AuthShell>
    );
  }

  // ── Recuperar senha ──
  if (mode === "forgot") {
    return (
      <AuthShell>
        <div className="auth-head">
          <h1 className="auth-title">Recuperar senha</h1>
          <p className="auth-hint">Informe seu e-mail. Um administrador vai providenciar sua senha.</p>
        </div>

        <form className="auth-form" onSubmit={handleForgot} noValidate>
          <FloatInput
            label="E-mail"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <AnimatePresence>
            {error && (
              <motion.div
                className="alert alert-error"
                initial={{ opacity: 0, y: -6, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(6px)" }}
                transition={{ duration: 0.32, ease: ease.outQuint }}
                role="alert"
              >
                <AlertCircle aria-hidden />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <Button type="submit" full size="lg" loading={loading} icon={!loading ? <ArrowRight size={16} aria-hidden /> : null}>
            {loading ? "Enviando…" : "Enviar pedido"}
          </Button>
        </form>

        <p className="auth-foot">
          <button type="button" className="auth-link" style={linkBtn} onClick={() => { setMode("login"); setError(""); }}>
            Voltar ao login
          </button>
        </p>
      </AuthShell>
    );
  }

  // ── Login ──
  return (
    <AuthShell>
      <div className="auth-head">
        <h1 className="auth-title">Entrar</h1>
        <p className="auth-hint">Acesse seu estúdio de conteúdo.</p>
      </div>

      <AnimatePresence>
        {justRegistered && (
          <motion.div
            className="alert alert-info mb-12"
            initial={{ opacity: 0, height: 0, filter: "blur(6px)" }}
            animate={{ opacity: 1, height: "auto", filter: "blur(0px)" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: ease.outExpo }}
          >
            <CheckCircle2 aria-hidden />
            <span>Conta confirmada. Faça login para continuar.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FloatInput
          label="E-mail"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FloatInput
          label="Senha"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div style={{ textAlign: "right", marginTop: -8 }}>
          <button
            type="button"
            className="auth-link"
            style={{ ...linkBtn, fontSize: "0.8rem" }}
            onClick={() => { setMode("forgot"); setError(""); }}
          >
            Esqueci minha senha
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              className="alert alert-error"
              initial={{ opacity: 0, y: -6, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(6px)" }}
              transition={{ duration: 0.32, ease: ease.outQuint }}
              role="alert"
            >
              <AlertCircle aria-hidden />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          full
          size="lg"
          loading={loading}
          icon={!loading ? <ArrowRight size={16} aria-hidden /> : null}
        >
          {loading ? "Entrando…" : "Entrar"}
        </Button>
      </form>

      <p className="auth-foot">
        Ainda não tem acesso?{" "}
        <Link className="auth-link" to="/register">
          Solicitar acesso
        </Link>
      </p>
    </AuthShell>
  );
}
