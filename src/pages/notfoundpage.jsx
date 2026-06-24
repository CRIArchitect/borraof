import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFoundPage() {
  return (
    <div className="notfound">
      <motion.span
        className="notfound-mark"
        initial={{ opacity: 0, filter: "blur(20px)" }}
        animate={{ opacity: 0.5, filter: "blur(0px)" }}
        transition={{ duration: 0.8 }}
        aria-hidden
      >
        Δ
      </motion.span>
      <h1 className="notfound-title">Página não encontrada</h1>
      <p className="notfound-sub">Esta rota se borrou e desapareceu. Vamos te levar de volta ao foco.</p>
      <Link to="/app" className="btn btn-primary">Voltar ao início</Link>
    </div>
  );
}
