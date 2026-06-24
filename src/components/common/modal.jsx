import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { overlay, scaleIn } from "../../lib/motion";

/**
 * Accessible modal dialog.
 * - role="dialog" aria-modal, labelled by title
 * - Escape to close, click-overlay to close
 * - focus moves in on open, is trapped, and returns to trigger on close
 * - body scroll locked while open
 */
export default function Modal({ open, onClose, title, children, actions, size = "md" }) {
  const boxRef = useRef(null);
  const lastFocused = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      boxRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) || [];

    // focus first control (or the box) on open
    const t = setTimeout(() => {
      const f = focusables();
      (f[0] || boxRef.current)?.focus();
    }, 20);

    const onKey = (e) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab") return;
      const f = Array.from(focusables());
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lastFocused.current?.focus?.();
    };
  }, [open, onClose]);

  const maxWidth = { sm: 420, md: 500, lg: 680 }[size] || 500;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          variants={overlay}
          initial="hidden"
          animate="show"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            ref={boxRef}
            className="modal-box edge-glow"
            style={{ maxWidth }}
            variants={scaleIn}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              {title && <h3 className="modal-title" id={titleId}>{title}</h3>}
              <button className="modal-close" onClick={onClose} aria-label="Fechar">
                <X size={16} />
              </button>
            </div>
            {children}
            {actions && <div className="modal-actions">{actions}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
