import { motion } from "framer-motion";
import { blurIn } from "../../lib/motion";

/**
 * AuthShell — layout full-screen das telas de autenticação.
 * Fundo: 3 blobs radiais (fogo / orquídea / céu) à deriva lenta
 * (auroraShift) + véu de contraste. Card central editorial com a
 * marca Borrão (Cormorant itálico, "ã" em fogo com glow) e o
 * subtítulo "by CRÏΔ" (Space Mono). Entrada em "desborrar".
 */
export default function AuthShell({ children }) {
  return (
    <div className="auth-shell">
      <div className="auth-aurora" aria-hidden>
        <span className="auth-blob auth-blob-1" />
        <span className="auth-blob auth-blob-2" />
        <span className="auth-blob auth-blob-3" />
      </div>
      <div className="auth-veil" aria-hidden />

      <motion.main
        className="auth-card"
        initial="hidden"
        animate="show"
        variants={blurIn}
      >
        <header className="auth-brand">
          <span className="auth-logo">
            Borr<span className="tilde">ã</span>o
          </span>
          <span className="auth-sub">
            by CR<span className="crid-accent">Ï</span>Δ
          </span>
        </header>

        {children}
      </motion.main>
    </div>
  );
}
