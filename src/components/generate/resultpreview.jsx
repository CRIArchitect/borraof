import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy, RefreshCw, Download, Trash2, AlertTriangle,
} from "lucide-react";

import IconButton from "../common/iconbutton";
import Button from "../common/button";
import Skeleton from "../common/skeleton";
import { useToast } from "../../context/toastcontext";
import { blurIn, ease } from "../../lib/motion";

const prefersReduced =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * ResultPreview — painel de resultado.
 * Props: { result, loading, error, companyName, onRegenerate, onClear }.
 * - loading: placeholder "desborrar" (skeleton shimmer + dots).
 * - error: bloco .alert-error SEPARADO do conteúdo + "Tentar novamente".
 * - result: revela com efeito de DIGITAÇÃO (palavra a palavra), cursor piscando.
 * - vazio: placeholder elegante com dica.
 */
export default function ResultPreview({
  result,
  loading,
  error,
  companyName,
  onRegenerate,
  onClear,
}) {
  const toast = useToast();
  const [typed, setTyped] = useState("");
  const [typing, setTyping] = useState(false);
  const timerRef = useRef(null);

  // Efeito de digitação palavra a palavra (respeita prefers-reduced-motion).
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!result) {
      setTyped("");
      setTyping(false);
      return;
    }
    if (prefersReduced) {
      setTyped(result);
      setTyping(false);
      return;
    }

    const tokens = result.match(/\S+\s*/g) || [result];
    let i = 0;
    setTyped("");
    setTyping(true);
    timerRef.current = setInterval(() => {
      i += 1;
      setTyped(tokens.slice(0, i).join(""));
      if (i >= tokens.length) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setTyping(false);
      }
    }, 28);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [result]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result);
      toast.success("Copiado", "Conteúdo copiado para a área de transferência.");
    } catch {
      toast.error("Não foi possível copiar", "Seu navegador bloqueou o acesso.");
    }
  }

  function handleExport() {
    try {
      const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safe = (companyName || "borrao")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "borrao";
      a.href = url;
      a.download = `borrao-${safe}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Exportado", "Arquivo .txt baixado.");
    } catch {
      toast.error("Falha ao exportar", "Tente novamente em instantes.");
    }
  }

  // ── ERRO (estado separado do conteúdo) ───────────────────────
  if (error) {
    return (
      <div className="result-shell">
        <motion.div
          className="result-error"
          variants={blurIn}
          initial="hidden"
          animate="show"
        >
          <div className="alert alert-error" role="alert">
            <AlertTriangle aria-hidden />
            <span>{error}</span>
          </div>
          <Button
            variant="secondary"
            icon={<RefreshCw size={15} />}
            onClick={onRegenerate}
          >
            Tentar novamente
          </Button>
        </motion.div>
      </div>
    );
  }

  // ── LOADING (desborrar) ──────────────────────────────────────
  if (loading) {
    return (
      <div className="result-shell">
        <div className="result-loading" role="status" aria-live="polite">
          <div className="result-loading-head">
            <span>
              Gerando conteúdo para{" "}
              <strong className="text-fogo">{companyName || "sua marca"}</strong>…
            </span>
            <span className="loading-dots" aria-hidden>
              <span className="loading-dot" />
              <span className="loading-dot" />
              <span className="loading-dot" />
            </span>
          </div>
          <div className="result-loading-lines">
            <Skeleton w="92%" h={13} />
            <Skeleton w="100%" h={13} />
            <Skeleton w="84%" h={13} />
            <Skeleton w="96%" h={13} />
            <Skeleton w="70%" h={13} />
            <Skeleton w="88%" h={13} />
            <Skeleton w="60%" h={13} />
          </div>
        </div>
      </div>
    );
  }

  // ── VAZIO ────────────────────────────────────────────────────
  if (!result) {
    return (
      <div className="result-shell">
        <motion.div
          className="result-empty"
          variants={blurIn}
          initial="hidden"
          animate="show"
        >
          <div className="result-empty-mark" aria-hidden>Borrão</div>
          <div className="result-empty-title">Pronto para desborrar</div>
          <p className="result-empty-sub">
            Escolha a empresa, o tipo de conteúdo e descreva o briefing. O
            resultado aparece aqui, nítido e pronto para usar.
          </p>
        </motion.div>
      </div>
    );
  }

  // ── RESULTADO ────────────────────────────────────────────────
  return (
    <div className="result-shell">
      <div className="result-head">
        <div className="result-head-meta">
          <span className="result-head-title">Resultado</span>
          {companyName && (
            <span className="result-head-sub">{companyName}</span>
          )}
        </div>
        <div className="result-actions">
          <IconButton label="Copiar" onClick={handleCopy}>
            <Copy size={16} />
          </IconButton>
          <IconButton label="Regenerar" onClick={onRegenerate}>
            <RefreshCw size={16} />
          </IconButton>
          <IconButton label="Exportar .txt" onClick={handleExport}>
            <Download size={16} />
          </IconButton>
          <IconButton label="Limpar" onClick={onClear}>
            <Trash2 size={16} />
          </IconButton>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="result-body"
          className="result-area"
          variants={blurIn}
          initial="hidden"
          animate="show"
          aria-live="polite"
        >
          {typed}
          {typing && <span className="result-caret" aria-hidden />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
