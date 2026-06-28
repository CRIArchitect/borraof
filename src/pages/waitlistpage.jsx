import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import AuthShell from "../components/auth/authshell";
import { blurIn } from "../lib/motion";

/**
 * WaitlistPage — status "Você está na fila".
 * Símbolo Δ animado (float + glow), texto e link de volta ao login.
 */
export default function WaitlistPage() {
  return (
    <AuthShell>
      <motion.div
        className="waitlist"
        variants={blurIn}
        initial="hidden"
        animate="show"
      >
        <span className="waitlist-glyph" aria-hidden>
          Δ
        </span>

        <h1 className="waitlist-title">Você está na fila</h1>

        <p className="waitlist-text">
          Recebemos sua solicitação. Assim que um administrador liberar seu
          acesso, você poderá entrar com seu e-mail e senha. O contorno está quase nítido.
        </p>

        <Link className="auth-back" to="/login">
          <ArrowLeft aria-hidden />
          Voltar ao login
        </Link>
      </motion.div>
    </AuthShell>
  );
}
