import { useState, useRef, useEffect } from "react";

// ── SYSTEM PROMPTS ────────────────────────────────────────────────────────────
const SYSTEM_PROMPTS = {
  nexus: `You are Officer Ray, a cheerful traffic police officer mascot for NEXUS — Neural EXchange for Urban Signals, an AI traffic management system built for DAKSH AI Hackathon 2026 (Cyber-Physical Systems track, SASTRA × TCS Foundation).

NEXUS FACTS:
- 3-layer system: Perception (YOLOv8 camera) → Intelligence (DQN RL agent) → Actuation (FastAPI + WebSocket)
- 16 intersections in 4x4 grid, each with its own DQN agent
- Trained 200,000 timesteps, reward improved -70,500 → -31,900 (55% improvement)
- Emergency pre-emption: full corridor green in under 1 second
- Weather adaptation: Rain x1.3, Fog x1.5, Storm x1.8 green phase multipliers
- Bus priority: immediate phase switch on bus detection
- Emissions: live CO2 savings vs fixed-time baseline
- Incident detection: flags congestion spikes and stalled vehicles
- Cost: $0 setup (open source), ~$185/month for 1,000 junctions. SCATS = Rs40L/junction install + Rs8L/year maintenance
- Stack: Python, FastAPI, YOLOv8, stable-baselines3, React, Docker, AWS
- GitHub: github.com/manaswi-30/nexus-traffic
- Market: $28B global smart traffic market by 2030, 50,000+ junctions in India, Rs2.05 lakh crore Smart Cities Mission
- SCATS deployed in Mumbai, Pune, Hyderabad — old, expensive, no AI

PERSONALITY: Friendly, warm, enthusiastic. Use police/traffic metaphors ("Green light on that!", "Stop right there — great question!", "All clear!"). Keep answers to 2-4 sentences unless detail is needed. Never break character.`,

  rules: `You are Officer Ray, a friendly and knowledgeable Indian traffic police officer AI assistant. You help citizens understand Indian traffic rules clearly under the Motor Vehicles Act 1988 (amended 2019).

KEY RULES:
- Speed limits: 50 kmph residential, 60-70 urban, 80-100 highways, 120 expressways
- Helmets: mandatory for rider and pillion, IS-certified only
- Seatbelts: mandatory for all occupants including rear seats
- Overtaking: only from right, never on curves/junctions/pedestrian crossings
- Lane discipline: keep left unless overtaking, heavy vehicles in leftmost lane
- Mobile phones: strictly prohibited while driving
- DUI: 0.03% BAC limit for private vehicles
- Red light: stop before stop line, yellow = prepare to stop
- Zebra crossing: pedestrians have absolute right of way
- Emergency vehicles: give way immediately by moving to left
- Parking: no parking within 15m of intersection, bus stop, fire hydrant
- School zones: 25 kmph, extra caution required
- Night driving: low beam in city, high beam only on empty highways

PERSONALITY: Warm, patient, helpful. Explain like you're helping a real citizen. Mention Motor Vehicles Act section when relevant. Keep answers clear and practical.`,

  fines: `You are Officer Ray, a knowledgeable Indian traffic police officer AI assistant explaining fines and penalties under the Motor Vehicles Amendment Act 2019.

FINES (MV Amendment Act 2019):
- Red light jumping: Rs 1,000 first offence, Rs 5,000 repeat
- Drunk driving: Rs 10,000 + 6 months jail (first), Rs 15,000 + 2 years jail (repeat)
- No helmet: Rs 1,000 + 3 month licence suspension
- No seatbelt: Rs 1,000
- Mobile phone while driving: Rs 1,000–5,000
- Speeding: Rs 1,000–2,000 (LMV), Rs 2,000–4,000 (heavy vehicles)
- Dangerous driving: Rs 1,000–5,000
- Racing on public roads: Rs 5,000 + 1 year jail
- No insurance: Rs 2,000 first, Rs 4,000 repeat
- No driving licence: Rs 5,000
- Driving with suspended licence: Rs 10,000 + up to 3 months jail
- No RC: Rs 2,000–5,000
- No PUC certificate: Rs 1,000 first, Rs 2,000 repeat
- Overloading passengers: Rs 1,000 per extra passenger
- Overloading goods: Rs 20,000 + Rs 2,000 per extra tonne
- Juvenile driving (under 18): Rs 25,000 + 3 years jail for guardian/owner
- Ambulance obstruction: Rs 10,000
- Road rage: Rs 1,000–5,000
- E-challans payable via Parivahan portal or VAHAN app

PERSONALITY: Direct but helpful. Note fines may vary by state. Always mention Parivahan portal for e-challan payment. Warm officer tone.`,

  license: `You are Officer Ray, a helpful Indian traffic police officer AI assistant for driving licence, RC, and documentation queries.

LICENCE KNOWLEDGE:
- Learner's Licence (LL): Apply at Sarathi portal (sarathi.parivahan.gov.in), need Aadhaar/address/age proof, fee Rs 150-200, valid 6 months
- Driving Licence: Apply 30 days after LL, pass driving test at RTO, fee Rs 300-500
- DL Documents: LL, age proof, address proof, passport photos, medical certificate Form 1A
- Renewal: DL valid 20 years up to age 40, then every 5 years. Renew at Sarathi portal
- International Driving Permit: Available at RTO, requires valid Indian DL, valid 1 year

RC / REGISTRATION:
- New vehicle: dealer handles temporary RC, permanent RC within 1 month
- RC documents: Form 20, sale certificate, insurance, PUC, address proof, invoice
- RC renewal: every 15 years for private vehicles (Form 25 at RTO)
- Transfer of ownership: Form 29+30 at RTO within 30 days of purchase

OTHER:
- Insurance: Third party mandatory, comprehensive recommended
- PUC: Petrol/CNG every 6 months, Diesel every 3 months, cost Rs 60-100
- Parivahan portal: parivahan.gov.in for all online services
- DigiLocker: Store DL and RC digitally — legally valid for traffic checking

PERSONALITY: Patient, step-by-step. Mention online portals wherever possible. Citizens are often confused about documentation — be clear and specific.`,

  general: `You are Officer Ray, a friendly and knowledgeable Indian traffic police officer AI helping with general road safety, signals, accidents, and driving queries.

GENERAL KNOWLEDGE:
- Traffic signals: Red=stop, Yellow=prepare to stop, Green=go. Flashing red=stop then proceed. Flashing yellow=slow down
- Traffic signs: Mandatory (round, red border), Cautionary (triangular, yellow), Informatory (rectangular, blue/green)
- Zebra crossing: Pedestrians have full right of way, vehicles must stop completely
- Emergency vehicles: Move to left immediately, never block ambulance/fire/police
- Accident procedure: Stop vehicle, inform police (100/112), don't move injured unless necessary, take photos, exchange insurance details, get FIR copy
- Road rage: Stay calm, don't engage, note vehicle number, call 100 if threatened
- One way roads: No entry from wrong side, heavy fine applies
- Highway: Never stop on highway except emergency, use shoulder only for breakdown, use hazard lights
- Night driving: Use low beam in city, watch for animals and pedestrians
- Monsoon: Reduce speed, maintain larger gap, avoid waterlogged roads, use headlights
- Breakdown: Move to left shoulder, turn hazard lights on, place warning triangle 50m behind, call NHAI 1033
- Child safety: No child under 12 in front seat, use child restraint seats for under 4 years
- Good Samaritan law: Bystanders helping accident victims are legally protected

HELPLINES: Police 100, Ambulance 108, National Emergency 112, NHAI 1033, Women 1091

PERSONALITY: Warm, reassuring, practical. Be clear and actionable. 2-4 sentences normally, more for complex questions.`,
};

const CHIPS = {
  nexus:   ["What is NEXUS?", "How does emergency pre-emption work?", "NEXUS vs SCATS?", "How does DQN learn?", "What does YOLOv8 detect?"],
  rules:   ["Speed limits in India?", "Helmet rules?", "Seatbelt rules?", "Rules for overtaking?", "Zebra crossing rules?"],
  fines:   ["Fine for jumping red light?", "Penalty for drunk driving?", "Fine for no helmet?", "Using phone while driving?", "No driving licence fine?"],
  license: ["How to get a driving licence?", "What is a learner's licence?", "How to renew my DL?", "Documents needed for RC?", "What is DigiLocker?"],
  general: ["How does a traffic signal work?", "What to do in an accident?", "Emergency vehicle rules?", "What is road rage?", "Breakdown on highway?"],
};

const GREETINGS = {
  nexus:   "Green light! I'm Officer Ray, your NEXUS guide. Ask me anything about our AI traffic management system!",
  rules:   "Stop right there — let me help! I know every traffic rule in the Indian Motor Vehicles Act. What would you like to know?",
  fines:   "Challan alert! I can tell you exactly what fines apply for any traffic violation under MV Act 2019. Ask away, citizen!",
  license: "Documents in order? I can help with driving licences, RC, PUC, insurance and all vehicle documentation. Fire away!",
  general: "Officer Ray here — your all-round traffic guide! Road safety, signals, accidents, emergencies — ask me anything.",
};

// ── OFFICER RAY SVG ────────────────────────────────────────────────────────────
function OfficerSvg({ state, size = 52 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg"
      style={{ transition: "transform 0.2s", transform: state === "thinking" ? "scale(1.05)" : "scale(1)" }}>
      {/* Hat */}
      <ellipse cx="26" cy="13" rx="11" ry="3" fill="#1e3a5f"/>
      <rect x="17" y="8" width="18" height="7" rx="2" fill="#1e3a5f"/>
      <rect x="15" y="13" width="22" height="2.5" rx="1" fill="#1e3a5f"/>
      <circle cx="26" cy="11" r="1.5" fill="#f0c419"/>
      <rect x="17" y="13" width="18" height="1.5" fill="#f0c419" opacity="0.8"/>
      {/* Face */}
      <circle cx="26" cy="21" r="8" fill="#FDDBB4"/>
      <circle cx="21" cy="23" r="2.5" fill="#f9a8a8" opacity="0.5"/>
      <circle cx="31" cy="23" r="2.5" fill="#f9a8a8" opacity="0.5"/>
      <circle cx="23.5" cy="20" r="1.5" fill="#1e293b"/>
      <circle cx="28.5" cy="20" r="1.5" fill="#1e293b"/>
      <circle cx="24" cy="19.5" r="0.5" fill="white"/>
      <circle cx="29" cy="19.5" r="0.5" fill="white"/>
      {state === "thinking"
        ? <path d="M22.5 22.5 Q26 22 29.5 22.5" stroke="#c47a5a" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        : <path d="M22.5 23.5 Q26 26.5 29.5 23.5" stroke="#c47a5a" strokeWidth="1.2" fill="none" strokeLinecap="round"/>}
      <ellipse cx="26" cy="22" rx="1" ry="0.7" fill="#d4956a"/>
      {/* Body */}
      <rect x="18" y="29" width="16" height="14" rx="3" fill="#1d4ed8"/>
      <polygon points="26,29 22,31 24,35 26,33 28,35 30,31" fill="#1e3a8a"/>
      <rect x="24" y="29" width="4" height="5" fill="#e2e8f0"/>
      <circle cx="26" cy="31.5" r="0.8" fill="#93c5fd"/>
      <circle cx="26" cy="34" r="0.8" fill="#93c5fd"/>
      <circle cx="26" cy="36.5" r="0.8" fill="#93c5fd"/>
      <rect x="19.5" y="31" width="5" height="4" rx="1" fill="#f0c419"/>
      <text x="22" y="34" textAnchor="middle" fontSize="2.5" fill="#92400e" fontWeight="bold">NEXUS</text>
      {/* Epaulettes */}
      <rect x="18" y="29" width="4" height="2.5" rx="1" fill="#1e40af"/>
      <rect x="30" y="29" width="4" height="2.5" rx="1" fill="#1e40af"/>
      <line x1="19" y1="29.5" x2="21" y2="29.5" stroke="#f0c419" strokeWidth="0.6"/>
      <line x1="19" y1="30.5" x2="21" y2="30.5" stroke="#f0c419" strokeWidth="0.6"/>
      <line x1="31" y1="29.5" x2="33" y2="29.5" stroke="#f0c419" strokeWidth="0.6"/>
      <line x1="31" y1="30.5" x2="33" y2="30.5" stroke="#f0c419" strokeWidth="0.6"/>
      {/* Left arm — waves when thinking */}
      <g style={{ transformOrigin: "14px 30px", animation: state === "thinking" ? "rayWave 0.6s ease-in-out infinite" : "none" }}>
        <rect x="9" y="30" width="5" height="10" rx="2.5" fill="#1d4ed8"/>
        <circle cx="11.5" cy="40" r="3.5" fill="#FDDBB4"/>
        <rect x="9.5" y="36.5" width="1.5" height="4" rx="0.75" fill="#FDDBB4"/>
        <rect x="11.5" y="36" width="1.5" height="4.5" rx="0.75" fill="#FDDBB4"/>
        <rect x="13" y="37" width="1.5" height="3.5" rx="0.75" fill="#FDDBB4"/>
      </g>
      {/* Right arm + whistle */}
      <rect x="38" y="30" width="5" height="8" rx="2.5" fill="#1d4ed8"/>
      <circle cx="40.5" cy="38" r="3" fill="#FDDBB4"/>
      <rect x="38" y="35" width="6" height="2.5" rx="1.2" fill="#d4a017"/>
      <rect x="43.5" y="35.5" width="3" height="1.5" rx="0.75" fill="#d4a017"/>
      {state === "speaking" && <circle cx="47" cy="36.2" r="1.5" fill="#bfdbfe"/>}
      {/* Legs */}
      <rect x="20" y="43" width="5" height="7" rx="2" fill="#1e3a5f"/>
      <rect x="27" y="43" width="5" height="7" rx="2" fill="#1e3a5f"/>
      <ellipse cx="22.5" cy="50" rx="4" ry="2" fill="#0f172a"/>
      <ellipse cx="29.5" cy="50" rx="4" ry="2" fill="#0f172a"/>
      <rect x="18" y="41.5" width="16" height="2" rx="1" fill="#0f172a"/>
      <rect x="24.5" y="41.3" width="3" height="2.4" rx="0.5" fill="#f0c419"/>
    </svg>
  );
}

// ── MINI OFFICER (for message avatar) ─────────────────────────────────────────
function MiniOfficer() {
  return (
    <svg width="26" height="26" viewBox="0 0 52 52">
      <ellipse cx="26" cy="13" rx="11" ry="3" fill="#1e3a5f"/>
      <rect x="17" y="8" width="18" height="7" rx="2" fill="#1e3a5f"/>
      <rect x="15" y="13" width="22" height="2.5" rx="1" fill="#1e3a5f"/>
      <rect x="17" y="13" width="18" height="1.5" fill="#f0c419" opacity="0.8"/>
      <circle cx="26" cy="21" r="8" fill="#FDDBB4"/>
      <circle cx="23.5" cy="20" r="1.5" fill="#1e293b"/>
      <circle cx="28.5" cy="20" r="1.5" fill="#1e293b"/>
      <path d="M22.5 23.5 Q26 26.5 29.5 23.5" stroke="#c47a5a" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <rect x="18" y="29" width="16" height="14" rx="3" fill="#1d4ed8"/>
    </svg>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────
export default function OfficerRay() {
  const [tab, setTab] = useState("nexus");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Officer Ray reporting for duty! I can help with NEXUS questions, Indian traffic rules, fines and penalties, licence and documentation, or any general road safety query. Pick a tab above or just ask me anything!" }
  ]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [officerState, setOfficerState] = useState("idle");
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isOpen && messages.length > 1) setUnread(u => u + 1);
  }, [messages]);

  useEffect(() => {
    if (isOpen) setUnread(0);
  }, [isOpen]);

  function switchTab(newTab) {
    setTab(newTab);
    setHistory([]);
    setMessages([{ role: "assistant", text: GREETINGS[newTab] }]);
  }

  async function sendMessage(overrideText) {
    const text = (overrideText || input).trim();
    if (!text || busy) return;
    setInput("");
    setBusy(true);
    setOfficerState("thinking");

    const userMsg = { role: "user", text };
    const newHistory = [...history, { role: "user", content: text }];
    setMessages(prev => [...prev, userMsg, { role: "assistant", text: "..." }]);
    setHistory(newHistory);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPTS[tab],
          messages: newHistory.slice(-10),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Radio's down! Try again, over.";
      setMessages(prev => [...prev.slice(0, -1), { role: "assistant", text: reply }]);
      setHistory(prev => [...prev, { role: "assistant", content: reply }]);
      setOfficerState("speaking");
      setTimeout(() => setOfficerState("idle"), 2000);
    } catch {
      setMessages(prev => [...prev.slice(0, -1), { role: "assistant", text: "Signal lost! Check connection and try again." }]);
      setOfficerState("idle");
    }
    setBusy(false);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  const TABS = [
    { key: "nexus",   label: "NEXUS" },
    { key: "rules",   label: "Rules" },
    { key: "fines",   label: "Fines" },
    { key: "license", label: "Licence" },
    { key: "general", label: "General" },
  ];

  const dotColor = officerState === "thinking" ? "#eab308" : "#22c55e";
  const subText  = officerState === "thinking" ? "Officer Ray is thinking..." : "Traffic AI — at your service!";

  return (
    <>
      {/* Keyframes injected once */}
      <style>{`
        @keyframes rayWave { 0%,100%{transform:rotate(-8deg)} 50%{transform:rotate(14deg)} }
        @keyframes rayBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes rayPop { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rayPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        .ray-msg { animation: rayPop 0.2s ease; }
        .ray-chip:hover { background:#1d4ed8 !important; color:#fff !important; border-color:#1d4ed8 !important; }
        .ray-tab-btn:hover { background:rgba(29,78,216,0.08) !important; }
        .ray-send:hover { background:#1e40af !important; }
        .ray-fab { animation: rayBounce 2s ease-in-out infinite; }
        .ray-fab:hover { transform:scale(1.12) !important; animation:none !important; }
      `}</style>

      {/* ── FLOATING BUTTON ── */}
      {!isOpen && (
        <div style={{ position:"fixed", bottom:28, right:28, zIndex:9999, cursor:"pointer" }}
          onClick={() => setIsOpen(true)}>
          <div className="ray-fab" style={{ position:"relative", width:64, height:64, borderRadius:"50%",
            background:"#1d4ed8", display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 4px 24px rgba(29,78,216,0.35)", transition:"transform 0.2s" }}>
            <OfficerSvg state="idle" size={48}/>
            {unread > 0 && (
              <div style={{ position:"absolute", top:-4, right:-4, width:20, height:20, borderRadius:"50%",
                background:"#ef4444", color:"#fff", fontSize:11, fontWeight:700,
                display:"flex", alignItems:"center", justifyContent:"center",
                border:"2px solid white" }}>{unread}</div>
            )}
          </div>
          <div style={{ position:"absolute", bottom:-22, left:"50%", transform:"translateX(-50%)",
            fontSize:11, color:"#475569", whiteSpace:"nowrap", fontWeight:500 }}>Officer Ray</div>
        </div>
      )}

      {/* ── CHAT WINDOW ── */}
      {isOpen && (
        <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, width:380,
          height:600, display:"flex", flexDirection:"column", borderRadius:16,
          background:"#0f172a", boxShadow:"0 8px 40px rgba(0,0,0,0.45)",
          overflow:"hidden", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px",
            background:"#1e293b", borderBottom:"1px solid #334155" }}>
            <div style={{ position:"relative", flexShrink:0 }}>
              <div style={{ width:48, height:48, borderRadius:"50%", background:"#0f172a",
                display:"flex", alignItems:"center", justifyContent:"center",
                border:"2px solid #334155" }}>
                <OfficerSvg state={officerState} size={40}/>
              </div>
              <div style={{ position:"absolute", bottom:1, right:1, width:11, height:11,
                borderRadius:"50%", background:dotColor, border:"2px solid #1e293b",
                transition:"background 0.3s" }}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:600, color:"#f1f5f9" }}>Officer Ray</div>
              <div style={{ fontSize:11, color:"#94a3b8", transition:"all 0.3s" }}>{subText}</div>
            </div>
            <button onClick={() => setIsOpen(false)}
              style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer",
                fontSize:20, lineHeight:1, padding:"2px 6px", borderRadius:6,
                transition:"color 0.15s" }}
              onMouseEnter={e=>e.target.style.color="#f1f5f9"}
              onMouseLeave={e=>e.target.style.color="#64748b"}>✕</button>
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", background:"#1e293b", borderBottom:"1px solid #334155" }}>
            {TABS.map(t => (
              <button key={t.key} className="ray-tab-btn"
                onClick={() => switchTab(t.key)}
                style={{ flex:1, padding:"8px 2px", fontSize:11, fontWeight: tab===t.key ? 600 : 400,
                  color: tab===t.key ? "#60a5fa" : "#64748b",
                  borderBottom: tab===t.key ? "2px solid #3b82f6" : "2px solid transparent",
                  background:"none", border:"none", borderBottom: tab===t.key ? "2px solid #3b82f6" : "2px solid transparent",
                  cursor:"pointer", transition:"all 0.15s" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"14px 12px", display:"flex",
            flexDirection:"column", gap:10, scrollBehavior:"smooth" }}>
            {messages.map((msg, i) => (
              <div key={i} className="ray-msg"
                style={{ display:"flex", gap:7, alignItems:"flex-end", maxWidth:"88%",
                  alignSelf: msg.role==="user" ? "flex-end" : "flex-start",
                  flexDirection: msg.role==="user" ? "row-reverse" : "row" }}>
                {/* Avatar */}
                <div style={{ width:28, height:28, flexShrink:0, borderRadius:"50%",
                  background:"#1e293b", display:"flex", alignItems:"center", justifyContent:"center",
                  border:"1px solid #334155", overflow:"hidden" }}>
                  {msg.role === "assistant"
                    ? <MiniOfficer/>
                    : <svg width="16" height="16" viewBox="0 0 18 18"><circle cx="9" cy="6" r="4" fill="#64748b"/><path d="M2 16c0-4 3.1-7 7-7s7 3 7 7" fill="#64748b"/></svg>}
                </div>
                {/* Bubble */}
                <div style={{
                  padding:"9px 12px", borderRadius:14, fontSize:13, lineHeight:1.55,
                  maxWidth:"100%", whiteSpace:"pre-wrap",
                  background: msg.role==="user" ? "#1d4ed8" : "#1e293b",
                  color: msg.role==="user" ? "#fff" : "#e2e8f0",
                  border: msg.role==="user" ? "none" : "1px solid #334155",
                  borderBottomLeftRadius: msg.role==="assistant" ? 3 : 14,
                  borderBottomRightRadius: msg.role==="user" ? 3 : 14,
                }}>
                  {msg.text === "..." ? (
                    <span style={{ display:"flex", gap:4, alignItems:"center" }}>
                      {[0,1,2].map(j=>(
                        <span key={j} style={{ width:7, height:7, borderRadius:"50%", background:"#64748b",
                          display:"inline-block", animation:`rayPulse 1.2s infinite ${j*0.2}s` }}/>
                      ))}
                    </span>
                  ) : msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef}/>
          </div>

          {/* Chips */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, padding:"6px 12px 2px" }}>
            {CHIPS[tab].map((chip, i) => (
              <button key={i} className="ray-chip"
                onClick={() => !busy && sendMessage(chip)}
                style={{ fontSize:11, padding:"4px 10px", borderRadius:20,
                  border:"1px solid #334155", background:"#1e293b", color:"#94a3b8",
                  cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap" }}>
                {chip}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ display:"flex", gap:8, padding:"8px 10px 12px", borderTop:"1px solid #334155",
            alignItems:"flex-end" }}>
            <textarea ref={textareaRef} value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height=""; e.target.style.height=Math.min(e.target.scrollHeight,88)+"px"; }}
              onKeyDown={handleKey}
              placeholder="Ask Officer Ray anything..."
              rows={1}
              style={{ flex:1, resize:"none", border:"1px solid #334155", borderRadius:20,
                padding:"8px 14px", fontSize:13, fontFamily:"inherit",
                color:"#f1f5f9", background:"#1e293b", outline:"none",
                maxHeight:88, lineHeight:1.4, overflowY:"auto",
                transition:"border-color 0.15s" }}
              onFocus={e=>e.target.style.borderColor="#3b82f6"}
              onBlur={e=>e.target.style.borderColor="#334155"}/>
            <button className="ray-send" onClick={() => sendMessage()} disabled={busy || !input.trim()}
              style={{ width:36, height:36, borderRadius:"50%", border:"none",
                background: busy||!input.trim() ? "#334155" : "#1d4ed8",
                color:"#fff", cursor: busy||!input.trim() ? "not-allowed" : "pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                flexShrink:0, transition:"all 0.15s" }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M2 8L14 2L10 8L14 14L2 8Z" fill="white"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
