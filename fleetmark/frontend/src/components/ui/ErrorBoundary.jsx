import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            background: "var(--bg)",
            color: "var(--ink)",
            textAlign: "center",
            padding: 24,
          }}
        >
          <div style={{ maxWidth: 400, display: "grid", gap: "var(--space-4)", placeItems: "center" }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 56, color: "var(--red)" }}
              aria-hidden
            >
              error
            </span>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Something went wrong</h1>
            <p style={{ color: "var(--mid)", margin: 0, fontSize: 14, lineHeight: 1.55 }}>
              {this.state.error?.message || "An unexpected error occurred. You can try again or return to your dashboard."}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                style={{
                  border: "1px solid var(--blue-bdr)",
                  background: "var(--blue-bg)",
                  color: "var(--blue)",
                  borderRadius: 10,
                  padding: "10px 20px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Try again
              </button>
              <a
                href="/"
                style={{
                  border: "1px solid var(--line)",
                  background: "var(--surface2)",
                  color: "var(--ink)",
                  borderRadius: 10,
                  padding: "10px 20px",
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                Back to home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
