import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowRight } from "lucide-react";

import AuthShell from "../components/auth/authshell";
import PasswordStrength from "../components/auth/passwordstrength";
import Button from "../components/common/button";
import { FloatInput } from "../components/common/field";
import { useAuth } from "../context/authcontext";
import { useToast } from "../context/toastcontext";
import { authService } from "../services/authservice";
import { errMsg } from "../services/api";
import { ease } from "../lib/motion";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    if (password.length < 6) {
      setError("Senha deve ter ao menos 6 caracteres.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await authService.register(email.trim(), name.trim(), password);
      login(data);
      toast.success("Conta criada", "Bem-vindo ao Borrão.");
      navigate("/app", { replace: true });
    } catch (err) {
      setError(errMsg(err, "Não foi possível criar a conta."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="auth-head">
        <h1 className="auth-title">Criar conta</h1>
        <p className="auth-hint">
          Crie sua conta no <strong>Borrão</strong> e comece a gerar conteúdo no DNA da sua marca.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
          {loading ? "Criando conta…" : "Criar conta"}
        </Button>
      </form>

      <p className="auth-foot">
        Já tem conta?{" "}
        <Link className="auth-link" to="/login">
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
