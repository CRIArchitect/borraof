import { createContext, useCallback, useContext, useRef, useState } from "react";
import Modal from "../components/common/modal";
import Button from "../components/common/button";

const ConfirmContext = createContext(null);

/**
 * Promise-based confirm dialog (replaces window.confirm).
 *   const confirm = useConfirm();
 *   if (await confirm({ title, message, danger })) { ... }
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((opts = {}) => {
    return new Promise((resolve) => {
      resolver.current = resolve;
      setState({
        title: opts.title || "Confirmar ação",
        message: opts.message || "Tem certeza?",
        confirmLabel: opts.confirmLabel || "Confirmar",
        cancelLabel: opts.cancelLabel || "Cancelar",
        danger: opts.danger || false,
      });
    });
  }, []);

  const close = (val) => {
    resolver.current?.(val);
    resolver.current = null;
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={!!state}
        onClose={() => close(false)}
        title={state?.title}
        size="sm"
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => close(false)}>
              {state?.cancelLabel}
            </Button>
            <Button
              variant={state?.danger ? "danger" : "primary"}
              size="sm"
              onClick={() => close(true)}
            >
              {state?.confirmLabel}
            </Button>
          </>
        }
      >
        <p className="text-muted" style={{ fontSize: 13.5, lineHeight: 1.65 }}>
          {state?.message}
        </p>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) return async () => window.confirm("Confirmar?");
  return ctx;
}
