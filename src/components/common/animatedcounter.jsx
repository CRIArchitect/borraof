import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

/** Counts up to `value` on mount/update. Renders in mono. */
export default function AnimatedCounter({ value = 0, duration = 1.1, className = "" }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const target = Number(value) || 0;
    const controls = animate(prev.current, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    prev.current = target;
    return () => controls.stop();
  }, [value, duration]);

  return <span className={className}>{display.toLocaleString("pt-BR")}</span>;
}
