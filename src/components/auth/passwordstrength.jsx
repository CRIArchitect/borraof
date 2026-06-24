import { motion } from "framer-motion";
import { ease } from "../../lib/motion";

/**
 * PasswordStrength — barra de força por comprimento + variedade.
 * Pontua: tamanho (>=8, >=12), minúscula, maiúscula, número, símbolo.
 * Props: { value }
 */
function score(pwd = "") {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 8) s++;
  if (pwd.length >= 12) s++;
  if (/[a-z]/.test(pwd)) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/\d/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s; // 0..6
}

const RANKS = [
  { key: "weak", label: "Fraca", color: "var(--coral)", segs: 1 },
  { key: "medium", label: "Média", color: "var(--ambar)", segs: 2 },
  { key: "strong", label: "Forte", color: "var(--menta)", segs: 3 },
];

export default function PasswordStrength({ value = "" }) {
  const s = score(value);
  // mapeia 0..6 → fraca/média/forte
  const rank = s <= 0 ? null : s <= 2 ? RANKS[0] : s <= 4 ? RANKS[1] : RANKS[2];
  const litSegs = rank ? rank.segs : 0;
  const color = rank ? rank.color : "var(--surface-3)";

  return (
    <div className="pwd-meter" aria-hidden={!value}>
      <div className="pwd-track">
        {[0, 1, 2].map((i) => (
          <div className="pwd-seg" key={i}>
            <motion.span
              className="pwd-seg-fill"
              initial={false}
              animate={{
                scaleX: i < litSegs ? 1 : 0,
                backgroundColor: color,
              }}
              transition={{ duration: 0.35, ease: ease.outExpo }}
            />
          </div>
        ))}
      </div>
      <div className="pwd-label">
        <span className="pwd-rank" data-rank={rank?.key}>
          {rank ? rank.label : "Força da senha"}
        </span>
        <span className="pwd-meta">
          {value
            ? `${value.length} caracteres`
            : "mín. 8 caracteres"}
        </span>
      </div>
    </div>
  );
}
