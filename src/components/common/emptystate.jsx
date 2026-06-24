import Reveal from "./reveal";

export default function EmptyState({ symbol = "Δ", title, subtitle, action }) {
  return (
    <Reveal className="empty-state">
      <div className="empty-state-symbol" aria-hidden>{symbol}</div>
      <div className="empty-state-title">{title}</div>
      {subtitle && <p className="empty-state-sub">{subtitle}</p>}
      {action && <div style={{ marginTop: 22 }}>{action}</div>}
    </Reveal>
  );
}
