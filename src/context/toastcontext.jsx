import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: <CheckCircle2 />,
  error: <AlertCircle />,
  info: <Info />,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const seq = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((type, title, msg, ttl = 4200) => {
    const id = ++seq.current;
    setToasts((t) => [...t, { id, type, title, msg }]);
    if (ttl) setTimeout(() => dismiss(id), ttl);
    return id;
  }, [dismiss]);

  const toast = useMemo(() => ({
    success: (title, msg) => push("success", title, msg),
    error: (title, msg) => push("error", title, msg),
    info: (title, msg) => push("info", title, msg),
  }), [push]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-stack" role="region" aria-label="Notificações" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              className={`toast toast-${t.type}`}
              initial={{ opacity: 0, x: 40, filter: "blur(6px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: 40, scale: 0.95, filter: "blur(6px)" }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            >
              <span className="toast-icon">{ICONS[t.type]}</span>
              <div className="toast-body">
                <div className="toast-title">{t.title}</div>
                {t.msg && <div className="toast-msg">{t.msg}</div>}
              </div>
              <button className="toast-close" onClick={() => dismiss(t.id)} aria-label="Fechar">
                <X size={14} />
              </button>
              <motion.div
                className="toast-timer"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 4.2, ease: "linear" }}
                style={{ width: "100%" }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { success() {}, error() {}, info() {} };
  return ctx;
}
