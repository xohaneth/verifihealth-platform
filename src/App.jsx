import { useState, useEffect } from "react";

const NAV_ITEMS = ["Dashboard", "Records", "Provenance", "Consent", "Analytics"];

const MOCK_RECORDS = [
  { id: "RX-001", type: "X-Ray", patient: "Ananya Sharma", date: "2025-03-01", status: "verified", hash: "0x4f3a...c912", location: "Mumbai, IN", size: "4.2 MB" },
  { id: "MR-002", type: "MRI Scan", patient: "Rajesh Kumar", date: "2025-02-28", status: "verified", hash: "0x7b2d...e451", location: "Delhi, IN", size: "128 MB" },
  { id: "LR-003", type: "Lab Report", patient: "Priya Patel", date: "2025-02-26", status: "pending", hash: "0x1c8f...a327", location: "Bangalore, IN", size: "0.8 MB" },
  { id: "PR-004", type: "Prescription", patient: "Mohammed Ali", date: "2025-02-24", status: "verified", hash: "0x9e5b...d763", location: "Hyderabad, IN", size: "0.2 MB" },
  { id: "VR-005", type: "Vaccination", patient: "Sunita Rao", date: "2025-02-22", status: "verified", hash: "0x3a7c...b891", location: "Chennai, IN", size: "0.1 MB" },
];

const CHAIN_EVENTS = [
  { time: "12:04:33", event: "Proof anchored on Aptos", record: "MR-002", latency: "42ms" },
  { time: "11:58:17", event: "Consent granted", record: "RX-001", latency: "38ms" },
  { time: "11:43:02", event: "Data read verified", record: "LR-003", latency: "29ms" },
  { time: "11:22:55", event: "New record stored", record: "PR-004", latency: "51ms" },
  { time: "10:59:44", event: "Audit trail queried", record: "VR-005", latency: "33ms" },
];

function GlowOrb({ x, y, color }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: 400, height: 400,
      borderRadius: "50%", background: color, filter: "blur(120px)",
      opacity: 0.12, pointerEvents: "none", zIndex: 0
    }} />
  );
}

function ProvenanceBadge({ status }) {
  const verified = status === "verified";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20,
      background: verified ? "rgba(0,255,170,0.1)" : "rgba(255,180,0,0.1)",
      border: `1px solid ${verified ? "rgba(0,255,170,0.3)" : "rgba(255,180,0,0.3)"}`,
      color: verified ? "#00ffaa" : "#ffb400",
      fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase"
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: verified ? "#00ffaa" : "#ffb400",
        boxShadow: verified ? "0 0 6px #00ffaa" : "0 0 6px #ffb400"
      }} />
      {verified ? "On-Chain Verified" : "Pending Proof"}
    </span>
  );
}

function StatCard({ label, value, unit, delta, icon }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16, padding: "24px 28px", position: "relative", overflow: "hidden",
      backdropFilter: "blur(12px)"
    }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 11, color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 36, fontWeight: 700, color: "#fff", fontFamily: "'Sora', sans-serif", lineHeight: 1 }}>{value}</span>
        {unit && <span style={{ fontSize: 14, color: "#666" }}>{unit}</span>}
      </div>
      {delta && <div style={{ marginTop: 8, fontSize: 12, color: "#00ffaa" }}>{delta}</div>}
    </div>
  );
}

function RecordRow({ record, onClick, selected }) {
  const typeColors = {
    "X-Ray": "#60a5fa", "MRI Scan": "#a78bfa", "Lab Report": "#34d399",
    "Prescription": "#fbbf24", "Vaccination": "#f472b6"
  };
  return (
    <div onClick={() => onClick(record)} style={{
      display: "grid", gridTemplateColumns: "80px 1fr 1fr 120px 1fr 140px",
      alignItems: "center", padding: "14px 20px", cursor: "pointer",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      background: selected ? "rgba(0,255,170,0.04)" : "transparent",
      transition: "background 0.2s",
      borderLeft: selected ? "2px solid #00ffaa" : "2px solid transparent"
    }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#666" }}>{record.id}</span>
      <span style={{
        fontSize: 12, fontWeight: 600, color: typeColors[record.type] || "#fff",
        background: `${typeColors[record.type]}18`, borderRadius: 6,
        padding: "3px 8px", display: "inline-block"
      }}>{record.type}</span>
      <span style={{ fontSize: 13, color: "#ccc" }}>{record.patient}</span>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#555" }}>{record.date}</span>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#555" }}>{record.hash}</span>
      <ProvenanceBadge status={record.status} />
    </div>
  );
}function RecordDetail({ record, onClose }) {
  if (!record) return null;
  return (
    <div style={{
      position: "fixed", right: 0, top: 0, bottom: 0, width: 400,
      background: "#0d0d0f", borderLeft: "1px solid rgba(255,255,255,0.08)",
      zIndex: 100, padding: 32, overflowY: "auto",
      animation: "slideIn 0.25s ease"
    }}>
      <style>{`@keyframes slideIn { from { transform: translateX(40px); opacity:0; } to { transform: translateX(0); opacity:1; } }`}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, margin: 0, color: "#fff" }}>Record Detail</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", fontSize: 20, cursor: "pointer" }}>✕</button>
      </div>
      <div style={{ marginBottom: 20 }}><ProvenanceBadge status={record.status} /></div>
      {[["Record ID", record.id],["Type", record.type],["Patient", record.patient],["Date", record.date],["Location", record.location],["File Size", record.size]].map(([k, v]) => (
        <div key={k} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4, fontFamily: "'DM Mono', monospace" }}>{k}</div>
          <div style={{ fontSize: 14, color: "#ccc" }}>{v}</div>
        </div>
      ))}
      <div style={{ marginTop: 24, padding: 16, background: "rgba(0,255,170,0.05)", border: "1px solid rgba(0,255,170,0.15)", borderRadius: 12 }}>
        <div style={{ fontSize: 11, color: "#00ffaa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>Cryptographic Hash</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#00ffaa", wordBreak: "break-all" }}>{record.hash}f3a9d2b7e1c8a4f2d6b9e3c7a1f4d8b2e6c9a3f7d1b4e8c2a6f9d3b7e1c4a8</div>
      </div>
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 11, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12, fontFamily: "'DM Mono', monospace" }}>Aptos Chain Proof</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {["Block anchored", "Timestamp recorded", "Consent verified", "Audit entry created"].map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(0,255,170,0.15)", border: "1px solid #00ffaa", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#00ffaa", fontSize: 10 }}>✓</span>
              </div>
              <span style={{ fontSize: 12, color: "#aaa" }}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [pulseIndex, setPulseIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const t = setInterval(() => setPulseIndex(i => (i + 1) % CHAIN_EVENTS.length), 2500);
    return () => clearInterval(t);
  }, []);

  const filteredRecords = MOCK_RECORDS.filter(r =>
    r.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#080809", color: "#fff", fontFamily: "'Sora', sans-serif", position: "relative", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <GlowOrb x="-100px" y="-100px" color="#00ffaa" />
      <GlowOrb x="60%" y="30%" color="#6366f1" />
      <GlowOrb x="20%" y="70%" color="#0ea5e9" />
      <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 240, background: "rgba(10,10,12,0.95)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", padding: "28px 0", zIndex: 50, backdropFilter: "blur(20px)" }}>
        <div style={{ padding: "0 24px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #00ffaa, #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⬡</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em" }}>VerifiHealth</div>
              <div style={{ fontSize: 10, color: "#444", fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }}>PROVENANCE PLATFORM</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "0 12px" }}>
          {NAV_ITEMS.map(item => {
            const icons = { Dashboard: "◈", Records: "⊞", Provenance: "◉", Consent: "⊛", Analytics: "◫" };
            const active = activeNav === item;
            return (
              <button key={item} onClick={() => { setActiveNav(item); setSelectedRecord(null); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, border: "none", cursor: "pointer", background: active ? "rgba(0,255,170,0.08)" : "transparent", color: active ? "#00ffaa" : "#555", fontSize: 13, fontWeight: active ? 600 : 400, textAlign: "left", marginBottom: 2, transition: "all 0.2s", borderLeft: active ? "2px solid #00ffaa" : "2px solid transparent", fontFamily: "'Sora', sans-serif" }}>
                <span style={{ fontSize: 14 }}>{icons[item]}</span>{item}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "20px 24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ffaa", boxShadow: "0 0 8px #00ffaa", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 11, color: "#555", fontFamily: "'DM Mono', monospace" }}>APTOS MAINNET</span>
          </div>
          <div style={{ fontSize: 11, color: "#333", fontFamily: "'DM Mono', monospace" }}>Block #48,291,774</div>
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        </div>
      </div>
      <div style={{ marginLeft: 240, padding: "32px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.03em" }}>{activeNav}</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#444", fontFamily: "'DM Mono', monospace" }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ padding: "8px 16px", borderRadius: 10, background: "rgba(0,255,170,0.06)", border: "1px solid rgba(0,255,170,0.2)", fontSize: 12, color: "#00ffaa", fontFamily: "'DM Mono', monospace", display: "flex", alignItems: "center", gap: 8 }}>⬡ Shelby Protocol v2.1</div>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>Dr</div>
          </div>
        </div>
        {activeNav === "Dashboard" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
              <StatCard label="Total Records" value="12,847" icon="🗂️" delta="↑ 3.2% this week" />
              <StatCard label="Verified On-Chain" value="99.8" unit="%" icon="🔐" delta="↑ 0.1% today" />
              <StatCard label="Avg Read Latency" value="38" unit="ms" icon="⚡" delta="↓ 12ms vs last week" />
              <StatCard label="Egress Cost Saved" value="68" unit="%" icon="💰" delta="vs. traditional CDN" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between" }}>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#ccc" }}>Live Provenance Feed</h3>
                  <span style={{ fontSize: 11, color: "#00ffaa", fontFamily: "'DM Mono', monospace" }}>LIVE ●</span>
                </div>
                {CHAIN_EVENTS.map((e, i) => (
                  <div key={i} style={{ padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.03)", display: "flex", alignItems: "center", gap: 16, background: pulseIndex === i ? "rgba(0,255,170,0.04)" : "transparent", transition: "background 0.5s" }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#444", minWidth: 64 }}>{e.time}</div>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: pulseIndex === i ? "#00ffaa" : "#333", boxShadow: pulseIndex === i ? "0 0 8px #00ffaa" : "none", transition: "all 0.5s", flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 13, color: "#bbb" }}>{e.event}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#555" }}>{e.record}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#00ffaa", minWidth: 40, textAlign: "right" }}>{e.latency}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
                <h3 style={{ margin: "0 0 20px", fontSize: 14, fontWeight: 600, color: "#ccc" }}>Active Consent Grants</h3>
                {[{ entity: "Apollo Hospital", scope: "Diagnostics", expires: "Jun 2025", color: "#60a5fa" },{ entity: "ICICI Lombard", scope: "Insurance Claim", expires: "Dec 2025", color: "#a78bfa" },{ entity: "Dr. Mehta AI", scope: "RAG Query", expires: "Mar 2025", color: "#34d399" },{ entity: "AIIMS Delhi", scope: "Research (anon)", expires: "Permanent", color: "#fbbf24" }].map((c, i) => (
                  <div key={i} style={{ padding: "12px 14px", borderRadius: 10, marginBottom: 10, background: `${c.color}08`, border: `1px solid ${c.color}22` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: "#ddd", fontWeight: 600 }}>{c.entity}</span>
                      <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#555" }}>Exp: {c.expires}</span>
                    </div>
                    <span style={{ fontSize: 11, color: c.color, background: `${c.color}15`, padding: "2px 8px", borderRadius: 4 }}>{c.scope}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {activeNav === "Records" && (
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#ccc" }}>Medical Records</h3>
              <input placeholder="Search records..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 14px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "'DM Mono', monospace", width: 200 }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr 120px 1fr 140px", padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["ID", "Type", "Patient", "Date", "Hash", "Status"].map(h => (
                <span key={h} style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'DM Mono', monospace" }}>{h}</span>
              ))}
            </div>
            {filteredRecords.map(record => (
              <RecordRow key={record.id} record={record} onClick={setSelectedRecord} selected={selectedRecord?.id === record.id} />
            ))}
          </div>
        )}
        {activeNav === "Provenance" && (
          <div>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 32, marginBottom: 24, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⛓️</div>
              <h2 style={{ fontSize: 20, marginBottom: 8 }}>On-Chain Proof Verification</h2>
              <p style={{ color: "#555", fontSize: 14, marginBottom: 24, maxWidth: 500, margin: "0 auto 24px" }}>Every read from Shelby's global namespace generates a cryptographic receipt anchored on Aptos blockchain.</p>
              <div style={{ display: "inline-flex", gap: 12 }}>
                <button style={{ padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #00ffaa, #0ea5e9)", color: "#000", fontWeight: 700, fontSize: 13 }}>Verify a Record</button>
                <button style={{ padding: "10px 24px", borderRadius: 10, cursor: "pointer", background: "transparent", color: "#ccc", border: "1px solid rgba(255,255,255,0.15)", fontSize: 13 }}>View Aptos Explorer</button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {[{ title: "What was served", desc: "Content hash of the exact data bytes delivered", icon: "🗂️" },{ title: "When it happened", desc: "Millisecond-precise timestamp on Aptos chain", icon: "🕐" },{ title: "From which location", desc: "Geographic node identifier from Shelby namespace", icon: "📍" },{ title: "By whom", desc: "Identity proof of the requesting entity", icon: "👤" },{ title: "Under what rights", desc: "Consent policy hash linked to patient's signed grant", icon: "📜" },{ title: "Immutable audit trail", desc: "Append-only log that cannot be altered or deleted", icon: "🔒" }].map((item, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{item.icon}</div>
                  <h4 style={{ margin: "0 0 6px", fontSize: 13, color: "#ddd" }}>{item.title}</h4>
                  <p style={{ margin: 0, fontSize: 12, color: "#555", lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeNav === "Consent" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {[{ entity: "Apollo Hospital", scope: "Full Diagnostics Access", type: "Permission-based", expires: "Jun 30, 2025", status: "active" },{ entity: "ICICI Lombard Insurance", scope: "Claim Verification Only", type: "Paid Access", expires: "Dec 31, 2025", status: "active" },{ entity: "Dr. Mehta's AI System", scope: "RAG Query — Anonymized", type: "Permission-based", expires: "Mar 15, 2025", status: "expiring" },{ entity: "AIIMS Research Division", scope: "Anonymized Research Data", type: "Permission-based", expires: "Permanent", status: "active" }].map((grant, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${grant.status === "expiring" ? "rgba(255,180,0,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 16, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <h4 style={{ margin: "0 0 4px", fontSize: 15, color: "#fff" }}>{grant.entity}</h4>
                    <div style={{ fontSize: 12, color: "#555" }}>{grant.type}</div>
                  </div>
                  <ProvenanceBadge status={grant.status === "active" ? "verified" : "pending"} />
                </div>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 14, padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>{grant.scope}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#444" }}>Expires: {grant.expires}</span>
                  <button style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid rgba(255,80,80,0.3)", background: "rgba(255,80,80,0.06)", color: "#ff6060", fontSize: 11, cursor: "pointer" }}>Revoke</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeNav === "Analytics" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
            <StatCard label="Records This Month" value="1,284" icon="📊" delta="↑ 18% vs last month" />
            <StatCard label="Proof Anchors (30d)" value="3,891" icon="⛓️" delta="99.97% success rate" />
            <StatCard label="Data Served" value="2.4" unit="TB" icon="📡" delta="↓ 68% egress cost" />
            <StatCard label="Consent Transactions" value="847" icon="✅" delta="0 unauthorized accesses" />
          </div>
        )}
      </div>
      {selectedRecord && <RecordDetail record={selectedRecord} onClose={() => setSelectedRecord(null)} />}
    </div>
  );
}
