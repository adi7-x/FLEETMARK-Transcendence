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
          <div>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 64, color: "var(--red)", marginBottom: 16 }}
            >
              error
            </span>
            <h1 style={{ margin: "0 0 8px" }}>Something went wrong.</h1>
            <p style={{ color: "var(--mid)", marginBottom: 24 }}>
              An unexpected error occurred in the application.
            </p>
            <button
              type="button"
              onClick={() => window.location.replace("/")}
              style={{
                border: "1px solid var(--blue-bdr)",
                background: "var(--blue-bg)",
                color: "var(--blue)",
                borderRadius: 8,
                padding: "10px 20px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
