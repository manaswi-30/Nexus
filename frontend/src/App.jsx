import { useState, useEffect, useRef, useCallback } from "react";
import OfficerRay from "./components/OfficerRay";

const API_BASE = "http://localhost:8000";
const WS_URL   = "ws://localhost:8000/ws";

const PHASE_COLORS = {
  NS_GREEN: "#22c55e", EW_GREEN: "#3b82f6",
  NS_LEFT:  "#f59e0b", EW_LEFT:  "#a855f7",
};
const PHASE_LABELS = {
  NS_GREEN: "N↕S", EW_GREEN: "E↔W",
  NS_LEFT:  "N↙",  EW_LEFT:  "E↙",
};

// ── AUTH HELPERS ──────────────────────────────────────────────────────────────
function getToken() { return localStorage.getItem("nexus_token"); }
function getUser()  { return JSON.parse(localStorage.getItem("nexus_user") || "null"); }
function saveAuth(token, user) {
  localStorage.setItem("nexus_token", token);
  localStorage.setItem("nexus_user", JSON.stringify(user));
}
function clearAuth() {
  localStorage.removeItem("nexus_token");
  localStorage.removeItem("nexus_user");
}

// ── LOGIN PAGE ────────────────────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [mode, setMode]       = useState("login"); // "login" or "register"
  const [form, setForm]       = useState({ full_name: "", email: "", password: "", role: "viewer" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.detail || "Registration failed"); setLoading(false); return; }
        setMode("login");
        setError("✅ Registered! Please log in.");
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Login failed"); setLoading(false); return; }
      saveAuth(data.access_token, { name: data.name, role: data.role, email: form.email });
      onLogin();
    } catch {
      setError("Cannot connect to server. Is the backend running?");
    }
    setLoading(false);
  };

  const inp = (placeholder, field, type = "text") => (
    <input
      type={type}
      placeholder={placeholder}
      value={form[field]}
      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
      onKeyDown={e => e.key === "Enter" && handleSubmit()}
      style={{
        width: "100%", padding: "11px 14px", borderRadius: 8,
        border: "1px solid #334155", background: "#1e293b",
        color: "#f1f5f9", fontSize: 14, outline: "none",
        marginBottom: 10,
      }}
    />
  );

  return (
    <div style={{
      minHeight: "100vh", background: "#020817",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{
        width: 380, background: "#0f172a", borderRadius: 16,
        border: "1px solid #1e293b", padding: 36,
        boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 6 }}>🚦</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#22c55e", letterSpacing: "-1px" }}>NEXUS</div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>Neural Traffic Control System</div>
        </div>

        {/* Toggle */}
        <div style={{ display: "flex", background: "#1e293b", borderRadius: 8, padding: 3, marginBottom: 24 }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 6, border: "none",
                background: mode === m ? "#22c55e" : "transparent",
                color: mode === m ? "#000" : "#64748b",
                fontWeight: mode === m ? 700 : 400,
                cursor: "pointer", fontSize: 13, transition: "all 0.2s",
                textTransform: "capitalize",
              }}>
              {m}
            </button>
          ))}
        </div>

        {/* Form */}
        {mode === "register" && inp("Full Name", "full_name")}
        {inp("Email address", "email", "email")}
        {inp("Password", "password", "password")}

        {mode === "register" && (
          <select
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            style={{
              width: "100%", padding: "11px 14px", borderRadius: 8,
              border: "1px solid #334155", background: "#1e293b",
              color: "#f1f5f9", fontSize: 14, outline: "none", marginBottom: 10,
            }}>
            <option value="viewer">Viewer — Read only access</option>
            <option value="operator">Operator — Can trigger emergency</option>
            <option value="admin">Admin — Full access</option>
          </select>
        )}

        {/* Error */}
        {error && (
          <div style={{
            padding: "9px 12px", borderRadius: 7, marginBottom: 12, fontSize: 12,
            background: error.startsWith("✅") ? "#052e16" : "#450a0a",
            border: `1px solid ${error.startsWith("✅") ? "#166534" : "#7f1d1d"}`,
            color: error.startsWith("✅") ? "#4ade80" : "#f87171",
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading}
          style={{
            width: "100%", padding: "12px 0", borderRadius: 8, border: "none",
            background: loading ? "#166534" : "#22c55e",
            color: "#000", fontWeight: 700, fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s",
          }}>
          {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
        </button>

        {/* Role hint */}
        <div style={{ marginTop: 20, padding: 12, background: "#1e293b", borderRadius: 8 }}>
          <div style={{ color: "#475569", fontSize: 11, marginBottom: 6, fontWeight: 600 }}>
            ROLE PERMISSIONS
          </div>
          {[
            ["Admin",    "Full access + logs + emissions data",  "#22c55e"],
            ["Operator", "Dashboard + emergency trigger",         "#f59e0b"],
            ["Viewer",   "Live dashboard — read only",            "#38bdf8"],
          ].map(([r, d, c]) => (
            <div key={r} style={{ display: "flex", gap: 8, marginBottom: 4, alignItems: "center" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: c, flexShrink: 0 }}/>
              <span style={{ color: c, fontSize: 11, fontWeight: 600, minWidth: 55 }}>{r}</span>
              <span style={{ color: "#475569", fontSize: 10 }}>{d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── WEBSOCKET HOOK ────────────────────────────────────────────────────────────
function useWebSocket(url) {
  const [data, setData]     = useState(null);
  const [status, setStatus] = useState("connecting");
  const wsRef    = useRef(null);
  const reconnRef = useRef(null);
  const connect  = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onopen    = () => setStatus("connected");
      ws.onmessage = e => setData(JSON.parse(e.data));
      ws.onerror   = () => setStatus("error");
      ws.onclose   = () => {
        setStatus("disconnected");
        reconnRef.current = setTimeout(connect, 3000);
      };
    } catch {
      setStatus("error");
      reconnRef.current = setTimeout(connect, 3000);
    }
  }, [url]);
  useEffect(() => {
    connect();
    return () => { clearTimeout(reconnRef.current); wsRef.current?.close(); };
  }, [connect]);
  return { data, status };
}

// ── KPI CARD ──────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, color = "#f0c419", icon }) {
  return (
    <div style={{
      background: "#0f172a", border: `1px solid ${color}22`,
      borderLeft: `3px solid ${color}`, borderRadius: 8,
      padding: "12px 14px", flex: 1, minWidth: 110,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 18, color, fontWeight: 700 }}>{value}</div>
        <span style={{ fontSize: 16, opacity: 0.7 }}>{icon}</span>
      </div>
      <div style={{ color: "#cbd5e1", fontSize: 11, fontWeight: 600, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ color: "#475569", fontSize: 10, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function WeatherPanel({ weather }) {
  if (!weather) return null;
  const cols = { Clear: "#f0c419", Cloudy: "#94a3b8", Rain: "#3b82f6", Fog: "#64748b", Storm: "#ef4444" };
  const col  = cols[weather.condition] || "#94a3b8";
  return (
    <div style={{
      background: "#0f172a", border: `1px solid ${col}33`,
      borderRadius: 8, padding: "12px 14px",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <span style={{ fontSize: 26 }}>{weather.icon || "☀️"}</span>
      <div>
        <div style={{ color: col, fontWeight: 700, fontSize: 13 }}>{weather.condition}</div>
        <div style={{ color: "#64748b", fontSize: 11 }}>{weather.temperature}°C</div>
      </div>
      <div style={{ marginLeft: "auto", textAlign: "right" }}>
        <div style={{ color: "#94a3b8", fontSize: 10 }}>Signal Multiplier</div>
        <div style={{ color: col, fontSize: 14, fontWeight: 700 }}>×{weather.timing_multiplier?.toFixed(1)}</div>
      </div>
    </div>
  );
}

function EmissionsPanel({ emissions }) {
  if (!emissions) return null;
  const items = [
    ["CO₂ Saved",       `${(emissions.total_co2_saved_kg || 0).toFixed(3)} kg`, "#22c55e"],
    ["Trees Equiv.",    `${(emissions.equivalent_trees   || 0).toFixed(2)}`,    "#4ade80"],
    ["Fuel Saved",      `${(emissions.fuel_saved_liters  || 0).toFixed(2)} L`,  "#f0c419"],
    ["Vehicles Served", `${(emissions.total_vehicles_served || 0).toLocaleString()}`, "#38bdf8"],
  ];
  return (
    <div style={{ background: "#0f172a", border: "1px solid #16a34a33", borderRadius: 8, padding: "12px 14px" }}>
      <div style={{ color: "#4ade80", fontWeight: 600, fontSize: 11, textTransform: "uppercase",
        letterSpacing: "0.08em", marginBottom: 10 }}>Environmental Impact</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {items.map(([l, v, c]) => (
          <div key={l} style={{ background: "#1e293b", borderRadius: 6, padding: "6px 10px" }}>
            <div style={{ color: "#64748b", fontSize: 10 }}>{l}</div>
            <div style={{ color: c, fontWeight: 700, fontSize: 12, marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IncidentsPanel({ incidents }) {
  if (!incidents?.length) return (
    <div style={{ background: "#0f172a", border: "1px solid #16a34a33", borderRadius: 8, padding: "10px 14px",
      display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 14 }}>✅</span>
      <span style={{ color: "#4ade80", fontSize: 12 }}>No active incidents</span>
    </div>
  );
  return (
    <div style={{ background: "#0f172a", border: "1px solid #ef444433", borderRadius: 8, padding: "12px 14px" }}>
      <div style={{ color: "#f87171", fontWeight: 600, fontSize: 11, textTransform: "uppercase",
        letterSpacing: "0.08em", marginBottom: 8 }}>Active Incidents ({incidents.length})</div>
      {incidents.slice(0, 3).map((inc, i) => (
        <div key={i} style={{
          background: "#1e293b", borderRadius: 6, padding: "6px 10px", marginBottom: 6,
          borderLeft: `3px solid ${inc.severity === "HIGH" ? "#ef4444" : "#f59e0b"}`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#e2e8f0", fontSize: 11 }}>{inc.type}</span>
            <span style={{ color: inc.severity === "HIGH" ? "#ef4444" : "#f59e0b", fontSize: 10 }}>{inc.severity}</span>
          </div>
          <div style={{ color: "#475569", fontSize: 10, marginTop: 2 }}>{inc.intersection_id}</div>
        </div>
      ))}
    </div>
  );
}

function IntersectionNode({ state, isCorridorActive, gridX, gridY }) {
  const color    = PHASE_COLORS[state.phase] || "#22c55e";
  const queueLvl = (state.queue_ns + state.queue_ew) / 2;
  const isHigh   = queueLvl > 0.6;
  return (
    <div style={{ position: "absolute", left: gridX - 34, top: gridY - 34,
      width: 68, height: 68, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center" }}>
      {state.emergency && (
        <div style={{ position: "absolute", inset: -6, borderRadius: "50%",
          border: "2px solid #ef4444", animation: "pulse 0.8s infinite", opacity: 0.9 }} />
      )}
      <div style={{ position: "absolute", inset: 0, borderRadius: 8,
        background: isCorridorActive ? "#ef444418"
          : `rgba(${Math.round(255*queueLvl)},${Math.round(255*(1-queueLvl))},0,0.1)`,
        border: `1.5px solid ${state.emergency ? "#ef4444" : state.incident_detected ? "#f59e0b" : color}`,
        transition: "all 0.4s" }} />
      <div style={{ width: 24, height: 24, borderRadius: "50%", background: color,
        boxShadow: `0 0 8px ${color}66`, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 8, fontWeight: 700, color: "#000",
        zIndex: 1, transition: "background 0.3s" }}>
        {PHASE_LABELS[state.phase] || "●"}
      </div>
      <div style={{ display: "flex", gap: 2, zIndex: 1, marginTop: 3 }}>
        {state.pedestrian_count > 0 && <span style={{ fontSize: 7 }}>🚶</span>}
        {state.bus_waiting       && <span style={{ fontSize: 7 }}>🚌</span>}
        {state.incident_detected && <span style={{ fontSize: 7 }}>⚠️</span>}
      </div>
      <div style={{ color: "#475569", fontSize: 8, zIndex: 1, marginTop: 1 }}>{state.id}</div>
      <div style={{ position: "absolute", bottom: 4, left: 8, right: 8,
        height: 2, background: "#1e293b", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${queueLvl * 100}%`,
          background: isHigh ? "#ef4444" : "#22c55e", transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

function RoadGrid({ intersections, emergency }) {
  const CELL = 148, PAD = 76, GRID = 4;
  const SIZE = GRID * CELL + PAD * 2;
  const corridorSet = new Set(emergency?.corridor || []);
  return (
    <div style={{ position: "relative", width: SIZE, height: SIZE,
      background: "#060d1e", borderRadius: 10, overflow: "hidden",
      border: "1px solid #1e293b", flexShrink: 0 }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        {Array.from({ length: GRID }).map((_, i) => (
          <g key={i}>
            <rect x={PAD/2} y={PAD + i*CELL - 5} width={SIZE - PAD} height={10} fill="#111827" />
            <line x1={PAD/2} y1={PAD + i*CELL} x2={SIZE - PAD/2} y2={PAD + i*CELL}
              stroke="#1f2937" strokeWidth={1} strokeDasharray="10,8" />
            <rect x={PAD + i*CELL - 5} y={PAD/2} width={10} height={SIZE - PAD} fill="#111827" />
            <line x1={PAD + i*CELL} y1={PAD/2} x2={PAD + i*CELL} y2={SIZE - PAD/2}
              stroke="#1f2937" strokeWidth={1} strokeDasharray="10,8" />
          </g>
        ))}
      </svg>
      {intersections.map(state => {
        const row = parseInt(state.id[1]), col = parseInt(state.id[2]);
        return (
          <IntersectionNode key={state.id} state={state}
            isCorridorActive={corridorSet.has(state.id)}
            gridX={PAD + col * CELL} gridY={PAD + row * CELL} />
        );
      })}
      {emergency?.active && (
        <div style={{ position: "absolute", top: 10, left: 10, right: 10,
          background: "#7f1d1d44", border: "1px solid #ef4444",
          borderRadius: 6, padding: "6px 12px",
          display: "flex", alignItems: "center", gap: 8 }}>
          <span>🚨</span>
          <div>
            <div style={{ color: "#f87171", fontWeight: 600, fontSize: 12 }}>Emergency Corridor Active</div>
            <div style={{ color: "#fca5a5", fontSize: 10 }}>
              {emergency.vehicle_type} — {emergency.corridor?.join(" → ")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CostTable() {
  const rows = [
    [10,    "$0.00",  "$0.000000", "Free tier"],
    [100,   "$0.08",  "$0.000026", "Near-zero"],
    [1000,  "$185",   "$0.006",    "Scalable"],
    [10000, "$1,720", "$0.0057",   "Economies of scale"],
  ];
  return (
    <div style={{ background: "#0f172a", borderRadius: 8, padding: 14, border: "1px solid #1e293b" }}>
      <div style={{ color: "#94a3b8", fontWeight: 600, fontSize: 11, textTransform: "uppercase",
        letterSpacing: "0.08em", marginBottom: 10 }}>Cost at Scale — vs ₹40L/junction (SCATS)</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr>{["Junctions","Monthly","Per Node/Day","Notes"].map(h => (
            <th key={h} style={{ color: "#475569", padding: "3px 6px", textAlign: "left", fontWeight: 500 }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.map(([n, m, p, s]) => (
            <tr key={n} style={{ borderTop: "1px solid #1e293b" }}>
              <td style={{ padding: "5px 6px", color: "#e2e8f0" }}>{n.toLocaleString()}</td>
              <td style={{ padding: "5px 6px", color: "#4ade80", fontWeight: 600 }}>{m}</td>
              <td style={{ padding: "5px 6px", color: "#64748b" }}>{p}</td>
              <td style={{ padding: "5px 6px", color: "#475569", fontSize: 10 }}>{s}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [authed, setAuthed] = useState(!!getToken());
  const user = getUser();

  const { data, status } = useWebSocket(authed ? WS_URL : null);
  const [tab, setTab] = useState("grid");

  const intersections = data?.intersections || [];
  const emergency     = data?.emergency     || {};
  const weather       = data?.weather       || {};
  const emissions     = data?.emissions     || {};
  const incidents     = data?.incidents     || [];
  const metrics       = data?.metrics       || {};

  const triggerEmergency = async () => {
    if (user?.role === "viewer") return alert("You need Operator or Admin role to trigger emergency!");
    try { await fetch(`${API_BASE}/emergency/trigger`, { method: "POST" }); } catch {}
  };

  const handleLogout = () => { clearAuth(); setAuthed(false); };

  // Show login page if not authenticated
  if (!authed) return <AuthPage onLogin={() => setAuthed(true)} />;

  const avgQueue  = ((metrics.avg_queue || 0) * 100).toFixed(1);
  const decisions = (metrics.total_decisions || 0).toLocaleString();
  const cost      = (metrics.total_cost_usd  || 0).toFixed(6);
  const co2       = (emissions.total_co2_saved_kg || 0).toFixed(3);
  const trees     = (emissions.equivalent_trees   || 0).toFixed(2);

  const roleColor = { admin: "#22c55e", operator: "#f59e0b", viewer: "#38bdf8" }[user?.role] || "#94a3b8";

  return (
    <div style={{ background: "#020817", minHeight: "100vh", color: "#e2e8f0",
      fontFamily: "'Segoe UI', system-ui, sans-serif", padding: 16 }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(1.25)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 14, background: "#0f172a",
        borderRadius: 10, padding: "14px 18px", border: "1px solid #1e293b" }}>
        <div>
          <div style={{ color: "#475569", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Intelligent Traffic Orchestration System
          </div>
          <h1 style={{ margin: "3px 0 0", fontSize: 20, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.5px" }}>
            🚦 NEXUS — Neural Traffic Control
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>

          {/* User badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8,
            background: "#1e293b", borderRadius: 20, padding: "5px 12px",
            border: `1px solid ${roleColor}44` }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: roleColor }}/>
            <span style={{ fontSize: 12, color: "#e2e8f0" }}>{user?.name}</span>
            <span style={{ fontSize: 10, color: roleColor, textTransform: "uppercase", fontWeight: 700 }}>
              {user?.role}
            </span>
          </div>

          {/* Emergency button — hidden for viewers */}
          {user?.role !== "viewer" && (
            <button onClick={triggerEmergency} style={{
              background: "#450a0a", color: "#f87171",
              border: "1px solid #7f1d1d", borderRadius: 6,
              padding: "6px 14px", cursor: "pointer", fontSize: 12,
              animation: emergency.active ? "blink 1s infinite" : "none",
            }}>
              🚨 {emergency.active ? "Emergency Active" : "Simulate Emergency"}
            </button>
          )}

          {/* Status */}
          <div style={{ display: "flex", alignItems: "center", gap: 6,
            background: status === "connected" ? "#052e16" : "#450a0a",
            border: `1px solid ${status === "connected" ? "#166534" : "#7f1d1d"}`,
            borderRadius: 20, padding: "4px 12px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%",
              background: status === "connected" ? "#22c55e" : "#ef4444",
              boxShadow: status === "connected" ? "0 0 5px #22c55e" : "none" }} />
            <span style={{ fontSize: 11, color: status === "connected" ? "#4ade80" : "#f87171" }}>
              {status === "connected" ? "Live" : status}
            </span>
          </div>

          {/* Logout */}
          <button onClick={handleLogout} style={{
            background: "transparent", color: "#475569",
            border: "1px solid #1e293b", borderRadius: 6,
            padding: "6px 12px", cursor: "pointer", fontSize: 12,
          }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <KPICard label="Intersections"  value={intersections.length || 16} icon="🗺️" color="#38bdf8" sub="4×4 grid" />
        <KPICard label="Avg Queue"      value={`${avgQueue}%`}             icon="🚗" color="#f0c419" sub="Network-wide" />
        <KPICard label="AI Decisions"   value={decisions}                  icon="🧠" color="#4ade80" sub="RL agent" />
        <KPICard label="Total Cost"     value={`$${cost}`}                 icon="💰" color="#a78bfa" sub="Running total" />
        <KPICard label="CO₂ Saved"      value={`${co2} kg`}               icon="🌱" color="#22c55e" sub={`≈ ${trees} trees`} />
        <KPICard label="Weather"        value={weather.icon || "☀️"}       icon="🌡️" color="#fb923c" sub={weather.condition || "Clear"} />
        <KPICard label="Pedestrians"    value={metrics.total_pedestrians || 0} icon="🚶" color="#38bdf8" sub="Active" />
        <KPICard label="Buses"          value={metrics.buses_waiting || 0} icon="🚌" color="#f59e0b" sub="Priority" />
        <KPICard label="Emergency"      value={emergency.active ? "🚨" : "✅"} icon="🚑"
          color={emergency.active ? "#ef4444" : "#22c55e"}
          sub={emergency.active ? emergency.vehicle_type : "Clear"} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12, borderBottom: "1px solid #1e293b", paddingBottom: 8 }}>
        {[["grid", "Grid View"], ["analytics", "Analytics"], ["features", "System Info"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "5px 14px",
            background: tab === id ? "#1e293b" : "transparent",
            color: tab === id ? "#f1f5f9" : "#64748b",
            border: tab === id ? "1px solid #334155" : "1px solid transparent",
            borderRadius: 6, cursor: "pointer", fontSize: 12,
            fontWeight: tab === id ? 600 : 400,
          }}>{label}</button>
        ))}
      </div>

      {/* Grid Tab */}
      {tab === "grid" && (
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div>
            <RoadGrid intersections={intersections} emergency={emergency} />
            <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
              {Object.entries(PHASE_COLORS).map(([phase, color]) => (
                <div key={phase} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 7, height: 7, borderRadius: 2, background: color }} />
                  <span style={{ color: "#475569", fontSize: 10 }}>{PHASE_LABELS[phase]}</span>
                </div>
              ))}
              {[["🚶","Pedestrian"],["🚌","Bus Priority"],["⚠️","Incident"]].map(([icon, label]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span style={{ fontSize: 10 }}>{icon}</span>
                  <span style={{ color: "#475569", fontSize: 10 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 10 }}>
            <WeatherPanel weather={weather} />
            <EmissionsPanel emissions={emissions} />
            <IncidentsPanel incidents={incidents} />
            <CostTable />
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {tab === "analytics" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: "#0f172a", borderRadius: 8, padding: 14, border: "1px solid #1e293b" }}>
            <div style={{ color: "#38bdf8", fontWeight: 600, fontSize: 11, textTransform: "uppercase",
              letterSpacing: "0.08em", marginBottom: 12 }}>Queue Levels per Intersection</div>
            {intersections.slice(0, 8).map(s => (
              <div key={s.id} style={{ marginBottom: 9 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ color: "#64748b", fontSize: 11 }}>{s.id}</span>
                  <span style={{ color: "#94a3b8", fontSize: 10 }}>
                    NS {(s.queue_ns * 100).toFixed(0)}% · EW {(s.queue_ew * 100).toFixed(0)}%
                  </span>
                </div>
                <div style={{ height: 3, background: "#1e293b", borderRadius: 2, display: "flex", gap: 2 }}>
                  <div style={{ width: `${s.queue_ns * 100}%`, background: "#22c55e", borderRadius: 2, transition: "width 0.5s" }} />
                  <div style={{ width: `${s.queue_ew * 100}%`, background: "#3b82f6", borderRadius: 2, transition: "width 0.5s" }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: "#0f172a", borderRadius: 8, padding: 14, border: "1px solid #1e293b" }}>
            <div style={{ color: "#fb923c", fontWeight: 600, fontSize: 11, textTransform: "uppercase",
              letterSpacing: "0.08em", marginBottom: 12 }}>Weather → Signal Timing</div>
            {[
              ["Clear",  "×1.0", "Normal operation",   "#4ade80"],
              ["Rain",   "×1.3", "Extended green time", "#38bdf8"],
              ["Fog",    "×1.5", "Reduced speed zones", "#94a3b8"],
              ["Storm",  "×1.8", "Emergency protocols", "#f87171"],
            ].map(([w, m, d, c]) => (
              <div key={w} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8,
                padding: "6px 8px", borderRadius: 6,
                background: weather.condition === w ? "#1e293b" : "transparent",
                border: weather.condition === w ? `1px solid ${c}44` : "1px solid transparent" }}>
                <span style={{ color: "#64748b", fontSize: 12, minWidth: 44 }}>{w}</span>
                <span style={{ color: c, fontWeight: 700, fontSize: 13, minWidth: 32 }}>{m}</span>
                <span style={{ color: "#475569", fontSize: 11 }}>{d}</span>
                {weather.condition === w && <span style={{ marginLeft: "auto", color: c, fontSize: 10 }}>now</span>}
              </div>
            ))}
          </div>
          <div style={{ background: "#0f172a", borderRadius: 8, padding: 14, border: "1px solid #16a34a22" }}>
            <div style={{ color: "#4ade80", fontWeight: 600, fontSize: 11, textTransform: "uppercase",
              letterSpacing: "0.08em", marginBottom: 12 }}>Emissions vs Fixed-Time Baseline</div>
            {[
              ["CO₂ Reduced",      `${(emissions.total_co2_saved_kg || 0).toFixed(4)} kg`, "#22c55e"],
              ["Equivalent Trees", `${(emissions.equivalent_trees   || 0).toFixed(3)}`,    "#4ade80"],
              ["Fuel Saved",       `${(emissions.fuel_saved_liters  || 0).toFixed(3)} L`,  "#f0c419"],
              ["Vehicles Served",  `${(emissions.total_vehicles_served || 0).toLocaleString()}`, "#38bdf8"],
            ].map(([l, v, c]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between",
                padding: "7px 0", borderBottom: "1px solid #1e293b" }}>
                <span style={{ color: "#64748b", fontSize: 12 }}>{l}</span>
                <span style={{ color: c, fontWeight: 600, fontSize: 12 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "#0f172a", borderRadius: 8, padding: 14, border: "1px solid #1e293b" }}>
            <div style={{ color: "#a78bfa", fontWeight: 600, fontSize: 11, textTransform: "uppercase",
              letterSpacing: "0.08em", marginBottom: 12 }}>System Performance</div>
            {[
              ["Active Intersections", intersections.length || 16,                        "#38bdf8"],
              ["Total AI Decisions",   (metrics.total_decisions || 0).toLocaleString(),   "#4ade80"],
              ["Buses in Priority",    metrics.buses_waiting || 0,                        "#f59e0b"],
              ["Pedestrians Detected", metrics.total_pedestrians || 0,                    "#38bdf8"],
              ["Running Cost (USD)",   `$${cost}`,                                        "#a78bfa"],
            ].map(([l, v, c]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between",
                padding: "7px 0", borderBottom: "1px solid #1e293b" }}>
                <span style={{ color: "#64748b", fontSize: 12 }}>{l}</span>
                <span style={{ color: c, fontWeight: 600, fontSize: 12 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features Tab */}
      {tab === "features" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
   {[
  {
    title: "Single Intersection Control",
    color: "#38bdf8",
    items: [
      ["Real-time queue monitoring", "Per-lane vehicle counts updated every second"],
      ["Pedestrian detection", "Crossing demand tracked at each node"],
      ["Emergency vehicle pre-emption", "Priority corridor created for emergency vehicles"],
      ["Incident detection", "Congestion spikes and abnormal traffic conditions detected automatically"],
      ["Weather-adaptive timing", "Signal timing adjusts dynamically based on weather conditions"],
    ],
  },
  {
    title: "Network Coordination",
    color: "#4ade80",
    items: [
      ["Shared Deep Q-Network", "One trained RL policy controls adaptive signal decisions across the 4×4 traffic network"],
      ["Adaptive signal timing", "Green signal duration optimized using live traffic conditions"],
      ["Bus and transit priority", "Priority signal allocation for buses and public transport"],
      ["Emissions tracking", "Estimated CO₂ savings compared with conventional fixed-time signals"],
      ["Dynamic condition response", "Weather, incidents and emergency vehicles influence signal decisions in real time"],
    ],
  },
  {
    title: "Security & Access",
    color: "#f0c419",
    items: [
      ["JWT Authentication", "Secure token-based login and session management"],
      ["Role-Based Access Control", "Admin, Operator and Viewer roles with permission-based access"],
      ["Password hashing", "bcrypt encryption ensures passwords are never stored in plain text"],
      ["Protected API routes", "Sensitive endpoints require valid authentication tokens"],
      ["Session management", "JWT tokens automatically expire after 60 minutes"],
    ],
  },
  {
    title: "Technology Stack",
    color: "#a78bfa",
    items: [
      ["YOLOv8 Nano", "Real-time vehicle, pedestrian and emergency vehicle detection"],
      ["Deep Q-Network (DQN)", "Adaptive traffic signal optimization trained for 200,000 timesteps using Stable-Baselines3"],
      ["FastAPI + WebSocket", "Real-time APIs and live dashboard updates"],
      ["SQLite + SQLAlchemy ORM", "Persistent storage for users, traffic logs and system data"],
      ["Groq API (Llama 3)", "AI-powered Officer Ray traffic assistant"],
    ],
  },
].map(panel => ( 
            <div key={panel.title} style={{ background: "#0f172a", borderRadius: 8, padding: 14,
              border: `1px solid ${panel.color}22` }}>
              <div style={{ color: panel.color, fontWeight: 600, fontSize: 11,
                textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                {panel.title}
              </div>
              {panel.items.map(([title, desc]) => (
                <div key={title} style={{ display: "flex", gap: 8, marginBottom: 9 }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: panel.color,
                    marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <div style={{ color: "#cbd5e1", fontSize: 12 }}>{title}</div>
                    <div style={{ color: "#475569", fontSize: 10, marginTop: 1 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 20, color: "#1e293b", fontSize: 10 }}>
        NEXUS · Multi-Agent RL · Weather Adaptive · Emissions Tracking · Emergency Pre-emption
      </div>

      <OfficerRay />
    </div>
  );
}
