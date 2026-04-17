import { useEffect, useState } from "react";
import type { ApiResponse, HealthResponse } from "@component-lab/types";
import { apiUrl, formatTimestamp } from "@component-lab/utils";
import "./App.css";

type HealthStatus = "idle" | "loading" | "ok" | "error";

export default function App() {
  const [status, setStatus] = useState<HealthStatus>("idle");
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function checkHealth() {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(apiUrl("/health"));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ApiResponse<HealthResponse> = await res.json();
      setHealth(json.data);
      setStatus("ok");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  }

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">⬡ Component Lab</div>
        <span className="badge">Monorepo · Day 1</span>
      </header>

      <main className="app-main">
        <section className="card">
          <h1 className="card-title">Backend Connectivity</h1>
          <p className="card-desc">
            Testing the shared-type contract between <code>apps/web</code> and{" "}
            <code>apps/api</code> via the <code>/health</code> endpoint.
          </p>

          <div className={`status-pill status-${status}`}>
            {status === "loading" && <span className="spinner" />}
            {status === "idle" && "Idle"}
            {status === "loading" && "Checking…"}
            {status === "ok" && "✓ API is reachable"}
            {status === "error" && `✗ ${errorMsg}`}
          </div>

          {health && (
            <div className="health-grid">
              <div className="health-item">
                <span className="health-label">Status</span>
                <span className="health-value">{health.status}</span>
              </div>
              <div className="health-item">
                <span className="health-label">Timestamp</span>
                <span className="health-value">
                  {formatTimestamp(health.timestamp)}
                </span>
              </div>
              <div className="health-item">
                <span className="health-label">Uptime</span>
                <span className="health-value">
                  {health.uptime.toFixed(2)}s
                </span>
              </div>
            </div>
          )}

          <button className="btn" onClick={checkHealth} disabled={status === "loading"}>
            {status === "loading" ? "Checking…" : "Re-check"}
          </button>
        </section>

        <section className="card info-card">
          <h2 className="card-title">Monorepo Structure</h2>
          <pre className="tree">{`component-lab/
├── apps/
│   ├── web/        ← React frontend (port 3000)
│   └── api/        ← Express backend (port 3001)
└── packages/
    ├── types/      ← Shared TypeScript types
    ├── utils/      ← Shared utility functions
    └── ui/         ← Shared UI components (Day 3)`}</pre>
        </section>
      </main>
    </div>
  );
}
