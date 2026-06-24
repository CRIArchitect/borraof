// ─────────────────────────────────────────────────────────────
// Borrão — shared motion language (framer-motion)
// The signature motif is "desborrar": content resolves from
// blur + low opacity into crisp focus. Every reveal uses it.
// ─────────────────────────────────────────────────────────────

// Easings (cubic-bezier) used across CSS + JS for consistency.
export const ease = {
  outExpo: [0.16, 1, 0.3, 1],
  outQuint: [0.22, 1, 0.36, 1],
  inOutQuint: [0.83, 0, 0.17, 1],
  spring: { type: "spring", stiffness: 420, damping: 32, mass: 0.9 },
  springSoft: { type: "spring", stiffness: 260, damping: 30 },
  springSnappy: { type: "spring", stiffness: 600, damping: 34 },
};

// The core "blur into focus" reveal.
export const blurIn = {
  hidden: { opacity: 0, filter: "blur(14px)", y: 14 },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.6, ease: ease.outExpo },
  },
  exit: {
    opacity: 0,
    filter: "blur(14px)",
    y: -10,
    transition: { duration: 0.32, ease: ease.outQuint },
  },
};

// Page-level transition (used by AnimatePresence on route change).
export const pageTransition = {
  hidden: { opacity: 0, filter: "blur(10px)", y: 12 },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.5, ease: ease.outExpo, when: "beforeChildren", staggerChildren: 0.05 },
  },
  exit: {
    opacity: 0,
    filter: "blur(8px)",
    y: -8,
    transition: { duration: 0.28, ease: ease.outQuint },
  },
};

// Stagger container — children animate in sequence.
export const stagger = (gap = 0.06, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

// Standard list/grid item (pairs with `stagger`).
export const item = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: ease.outExpo } },
};

// Simple fade+rise (no blur) for lighter elements.
export const rise = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: ease.outQuint } },
};

// Scale-in for modals / popovers.
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96, filter: "blur(8px)" },
  show: { opacity: 1, scale: 1, filter: "blur(0px)", transition: ease.spring },
  exit: { opacity: 0, scale: 0.97, filter: "blur(6px)", transition: { duration: 0.18 } },
};

// Overlay fade.
export const overlay = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// Interactive hover/tap presets for cards & buttons.
export const hoverLift = {
  rest: { y: 0 },
  hover: { y: -4, transition: ease.springSnappy },
  tap: { scale: 0.985 },
};

export const tapScale = { whileTap: { scale: 0.96 }, whileHover: { scale: 1.02 } };

// Respect reduced-motion: callers can read this to disable.
export const reduceMotion = typeof window !== "undefined"
  && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
