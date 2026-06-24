import { motion } from "framer-motion";
import AnimatedCounter from "../common/animatedcounter";
import { item, ease } from "../../lib/motion";

/**
 * StatCard — ícone lucide no topo, valor grande (Syne) com AnimatedCounter,
 * label (Space Mono uppercase) e mini-sparkline opcional (SVG de barras).
 * props: { icon, label, value, spark?, accent? }
 * - value numérico usa AnimatedCounter; string/qualquer outro é renderizado direto.
 * - spark: array de números -> barras; se vazio/ausente, omite.
 */
export default function StatCard({ icon: Icon, label, value, spark, accent = false }) {
  const isNumeric = typeof value === "number" && Number.isFinite(value);
  const bars = Array.isArray(spark) ? spark.filter((n) => Number.isFinite(Number(n))) : [];
  const hasSpark = bars.length > 1;

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -4, transition: ease.springSnappy }}
      whileTap={{ scale: 0.99 }}
      className={`stat-card${accent ? " stat-card--accent" : ""}`}
    >
      <span className="stat-card-glow" aria-hidden />
      <div className="stat-card-top">
        <span className="stat-card-icon" aria-hidden>
          {Icon ? <Icon /> : null}
        </span>
        {hasSpark && <Sparkline values={bars} />}
      </div>

      <div className="stat-card-value">
        {isNumeric ? (
          <AnimatedCounter value={value} />
        ) : (
          <span className="stat-card-value-text">{value}</span>
        )}
      </div>

      <div className="stat-card-label">{label}</div>
    </motion.div>
  );
}

/** Mini-sparkline de barras em SVG simples, normalizado para a altura. */
function Sparkline({ values }) {
  const max = Math.max(...values, 1);
  const count = values.length;
  const W = 64;
  const H = 26;
  const gap = 2;
  const bw = (W - gap * (count - 1)) / count;

  return (
    <svg
      className="stat-card-spark"
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      preserveAspectRatio="none"
      aria-hidden
    >
      {values.map((v, i) => {
        const h = Math.max(2, (Number(v) / max) * H);
        const x = i * (bw + gap);
        const y = H - h;
        const last = i === count - 1;
        return (
          <motion.rect
            key={i}
            x={x}
            y={y}
            width={bw}
            height={h}
            rx={1}
            className={last ? "spark-bar spark-bar--last" : "spark-bar"}
            initial={{ scaleY: 0, originY: 1 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.5, delay: 0.15 + i * 0.04, ease: ease.outExpo }}
            style={{ transformBox: "fill-box", transformOrigin: "bottom" }}
          />
        );
      })}
    </svg>
  );
}
