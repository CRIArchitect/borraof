import { Component } from "react";

/** Catches render errors so a single failure can't blank the whole app. */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("Borrão — erro de render:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="boundary">
          <span className="boundary-mark" aria-hidden>Δ</span>
          <h1 className="boundary-title">Algo borrou demais.</h1>
          <p className="boundary-sub">
            Encontramos um erro inesperado ao renderizar a tela.
          </p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
