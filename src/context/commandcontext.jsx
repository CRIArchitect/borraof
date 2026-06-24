import { createContext, useCallback, useContext, useEffect, useState } from "react";

const CommandContext = createContext(null);

/** Holds command-palette open state + the global ⌘K / Ctrl+K shortcut. */
export function CommandProvider({ children }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  return (
    <CommandContext.Provider value={{ open, setOpen, toggle }}>
      {children}
    </CommandContext.Provider>
  );
}

export function useCommand() {
  return useContext(CommandContext) || { open: false, setOpen() {}, toggle() {} };
}
