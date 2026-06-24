export default function LoadingState({ message = "Carregando…" }) {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-dots">
        <div className="loading-dot" />
        <div className="loading-dot" />
        <div className="loading-dot" />
      </div>
      <span>{message}</span>
    </div>
  );
}
