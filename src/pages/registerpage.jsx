import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowLeft, Send, ShieldCheck } from "lucide-react";

import AuthShell from "../components/auth/authshell";
import OTPInput from "../components/auth/otpinput";
import PasswordStrength from "../components/auth/passwordstrength";
import Button from "../components/common/button";
import { FloatInput } from "../components/common/field";
import { useToast } from "../context/toastcontext";
import { authService } from "../services/authservice";
import { errMsg } from "../services/api";
import { blurIn } from "../lib/motion";

const STEP_VARIANTS = {
  hidden: { opacity: 0, filter: "blur(12px)", y: 14 },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    filter: "blur(12px)",
    y: -12,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState("request"); // request | verify
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRequest(e) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await authService.requestAccess(email.trim(), name.trim());
      toast.success("Código enviado", "Confira seu e-mail para confirmar.");
      setStep("verify");
    } catch (err) {
      setError(errMsg(err, "Não foi possível solicitar acesso."));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    if (loading) return;
    if (code.length < 6) {
      setError("Informe os 6 dígitos do código.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await authService.verifyCode(email.trim(), code, password);
      toast.success("Conta confirmada", "Já pode entrar.");
      navigate("/login?registered=1", { replace: true });
    } catch (err) {
      setError(errMsg(err, "Código inválido ou expirado."));
    } finally {
      setLoading(false);
    }
  }

  function backToRequest() {
    setError("");
    setCode("");
    setStep("request");
  }

  return (
    <AuthShell>
      <AnimatePresence mode="wait" initial={false}>
        {step === "request" ? (
          <motion.div
            key="request"
            variants={STEP_VARIANTS}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <div className="auth-head">
              <h1 className="auth-title">Solicitar acesso</h1>
              <p className="auth-hint">
                Entre na lista do <strong>Borrão</strong>. Enviamos um código
                para confirmar seu e-mail.
              </p>
            </div>

            <form className="auth-form" onSubmit={handleRequest} noValidate>
              <FloatInput
                label="Nome"
                type="text"
                name="name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
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
                    variants={blurIn}
                    initial="hidden"
                    animate="show"
                    exit="exit"
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
                icon={!loading ? <Send size={16} aria-hidden /> : null}
              >
                {loading ? "Enviando…" : "Solicitar código"}
              </Button>
            </form>

            <p className="auth-foot">
              Já tem conta?{" "}
              <Link className="auth-link" to="/login">
                Entrar
              </Link>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="verify"
            variants={STEP_VARIANTS}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <div className="auth-head">
              <h1 className="auth-title">Confirmar e-mail</h1>
              <p className="auth-hint">
                Digite o código enviado para <strong>{email}</strong> e defina
                sua senha.
              </p>
            </div>

            <form className="auth-form" onSubmit={handleVerify} noValidate>
              <OTPInput value={code} onChange={setCode} length={6} />

              <div>
                <FloatInput
                  label="Senha"
                  type="password"
                  name="new-password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="mt-8">
                  <PasswordStrength value={password} />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    className="alert alert-error"
                    variants={blurIn}
                    initial="hidden"
                    animate="show"
                    exit="exit"
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
                icon={!loading ? <ShieldCheck size={16} aria-hidden /> : null}
              >
                {loading ? "Confirmando…" : "Confirmar e criar conta"}
              </Button>

              <button type="button" className="auth-back" onClick={backToRequest}>
                <ArrowLeft aria-hidden />
                Voltar e corrigir e-mail
              </button>
            </form>

            <p className="auth-foot">
              Já tem conta?{" "}
              <Link className="auth-link" to="/login">
                Entrar
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}
