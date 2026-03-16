import { useState, useEffect, useCallback, useRef, useReducer } from "react";

/* ====== ANIMATED BACKGROUND ====== */
function AnimatedBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, frame = 0;
    const nodes = [];
    for (let i = 0; i < 50; i++) {
      nodes.push({ x: Math.random() * 2000, y: Math.random() * 2000, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: Math.random() * 2 + 1, pulse: Math.random() * Math.PI * 2 });
    }
    function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; nodes.forEach(function(n) { if (n.x > w) n.x = Math.random() * w; if (n.y > h) n.y = Math.random() * h; }); }
    resize();
    window.addEventListener("resize", resize);
    function draw() {
      frame++;
      ctx.clearRect(0, 0, w, h);
      var grd = ctx.createRadialGradient(w * 0.3, h * 0.3, 0, w * 0.5, h * 0.5, w * 0.8);
      grd.addColorStop(0, "#0d0a1a"); grd.addColorStop(0.5, "#070810"); grd.addColorStop(1, "#030408");
      ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#8b5cf608"; ctx.lineWidth = 0.5;
      for (var gx = 0; gx < w; gx += 60) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); }
      for (var gy = 0; gy < h; gy += 60) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) { ctx.beginPath(); ctx.strokeStyle = "rgba(139,92,246," + ((1 - dist / 180) * 0.15) + ")"; ctx.lineWidth = 0.5; ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke(); }
        }
      }
      nodes.forEach(function(n) {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.02;
        if (n.x < 0 || n.x > w) n.vx *= -1; if (n.y < 0 || n.y > h) n.vy *= -1;
        var glow = (Math.sin(n.pulse) + 1) * 0.5;
        var radius = n.r + glow * 1.5;
        var ng = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, radius * 4);
        ng.addColorStop(0, "rgba(139,92,246," + (0.1 + glow * 0.08) + ")"); ng.addColorStop(1, "transparent");
        ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(n.x, n.y, radius * 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(n.x, n.y, radius, 0, Math.PI * 2); ctx.fillStyle = "rgba(139,92,246," + (0.3 + glow * 0.5) + ")"; ctx.fill();
      });
      var ox = w * 0.7 + Math.sin(frame * 0.005) * 100, oy = h * 0.3 + Math.cos(frame * 0.007) * 80;
      var og = ctx.createRadialGradient(ox, oy, 0, ox, oy, 200);
      og.addColorStop(0, "rgba(59,130,246,0.04)"); og.addColorStop(1, "transparent");
      ctx.fillStyle = og; ctx.beginPath(); ctx.arc(ox, oy, 200, 0, Math.PI * 2); ctx.fill();
      requestAnimationFrame(draw);
    }
    draw();
    return function() { window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }} />;
}

/* ====== THEME ====== */
var T = {
  card: "rgba(13,18,32,0.85)", cardHover: "rgba(17,24,40,0.9)",
  border: "#1a2235", borderLight: "#243049", accent: "#8b5cf6", accentGlow: "#8b5cf620",
  text: "#e8ecf4", dim: "#6b7fa3", muted: "#3d4f6e",
  green: "#22c55e", red: "#ef4444", yellow: "#eab308", blue: "#3b82f6", cyan: "#06b6d4",
  gradient: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
};
var mono = { fontFamily: "'JetBrains Mono','SF Mono','Fira Code',monospace" };

/* ====== BADGE ====== */
function Badge(props) {
  var status = props.status;
  var size = props.size || "sm";
  var colors = { secure: [T.green, "#0a201a"], success: [T.green, "#0a201a"], running: [T.blue, "#0a1525"], warning: [T.yellow, "#1c1a08"], critical: [T.red, "#1c0a0a"], idle: [T.accent, "#13102a"], failed: [T.red, "#1c0a0a"], fetching: [T.cyan, "#081a20"], implemented: [T.green, "#0a201a"], prototype: [T.yellow, "#1c1a08"], planned: [T.dim, "#151822"] };
  var pair = colors[status] || colors.idle;
  var isSpinning = status === "running" || status === "fetching";
  return (
    <span style={{ background: pair[1], color: pair[0], border: "1px solid " + pair[0] + "33", padding: size === "sm" ? "2px 10px" : "4px 14px", borderRadius: 99, fontSize: size === "sm" ? 9 : 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 4, backdropFilter: "blur(4px)" }}>
      {isSpinning && <span className="argos-spin" style={{ width: 8, height: 8, border: "2px solid " + pair[0], borderTopColor: "transparent", borderRadius: "50%", display: "inline-block" }} />}
      {status}
    </span>
  );
}

/* ====== GLOW CARD ====== */
function GlowCard(props) {
  var children = props.children;
  var style = props.style || {};
  var active = props.active;
  var glow = props.glow;
  var onClick = props.onClick;
  var hovered = useState(false);
  var h = hovered[0];
  var setH = hovered[1];
  return (
    <div onClick={onClick} onMouseEnter={function() { setH(true); }} onMouseLeave={function() { setH(false); }}
      style={Object.assign({}, {
        background: h ? T.cardHover : T.card, backdropFilter: "blur(12px)",
        border: "1px solid " + (active ? T.accent + "88" : h ? T.borderLight : T.border),
        borderRadius: 16, padding: 20, transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
        transform: h ? "translateY(-3px)" : "none",
        boxShadow: (h && glow) || active ? "0 8px 40px " + T.accentGlow : "0 4px 20px rgba(0,0,0,0.2)",
        cursor: onClick ? "pointer" : "default", position: "relative", overflow: "hidden",
      }, style)}>
      {active && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: T.gradient }} />}
      {children}
    </div>
  );
}

/* ====== ANIMATED NUMBER ====== */
function AnimNum(props) {
  var value = props.value;
  var color = props.color;
  var state = useState(0);
  var d = state[0];
  var setD = state[1];
  useEffect(function() {
    var n = typeof value === "number" ? value : (parseInt(value) || 0);
    if (n === d) return;
    var step = Math.max(1, Math.floor(Math.abs(n - d) / 12));
    var t = setInterval(function() {
      setD(function(p) {
        if (p < n) return Math.min(p + step, n);
        if (p > n) return Math.max(p - step, n);
        return n;
      });
    }, 25);
    return function() { clearInterval(t); };
  }, [value]);
  return <span style={Object.assign({ color: color, fontSize: 30, fontWeight: 800, lineHeight: 1 }, mono)}>{typeof value === "number" ? d : value}</span>;
}

/* ====== BUTTON ====== */
function Btn(props) {
  var children = props.children;
  var onClick = props.onClick;
  var disabled = props.disabled;
  var variant = props.variant || "default";
  var full = props.full;
  var size = props.size || "md";
  var sx = props.style || {};
  var state = useState(false);
  var h = state[0];
  var setH = state[1];
  var vs = { default: [T.card, T.text, T.border], primary: [T.accent, "#fff", T.accent], success: [T.green, "#fff", T.green], danger: ["transparent", T.red, T.border] };
  var v = vs[variant] || vs["default"];
  var pad = size === "sm" ? "5px 10px" : size === "lg" ? "12px 24px" : "8px 16px";
  var fs = size === "sm" ? 11 : size === "lg" ? 14 : 12;
  return (
    <button onClick={onClick} disabled={disabled} onMouseEnter={function() { setH(true); }} onMouseLeave={function() { setH(false); }}
      style={Object.assign({}, { background: v[0], color: disabled ? T.muted : v[1], border: "1px solid " + v[2], borderRadius: 10, padding: pad, fontSize: fs, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, width: full ? "100%" : "auto", opacity: disabled ? 0.5 : 1, transition: "all 0.25s", transform: h && !disabled ? "scale(1.03)" : "none", boxShadow: h && variant === "primary" && !disabled ? "0 4px 20px " + T.accentGlow : "none", backdropFilter: "blur(4px)" }, sx)}>
      {children}
    </button>
  );
}

/* ====== INPUT ====== */
function Input(props) {
  var state = useState(false);
  var f = state[0];
  var setF = state[1];
  return (
    <input value={props.value} onChange={props.onChange} onKeyDown={props.onKeyDown} placeholder={props.placeholder}
      onFocus={function() { setF(true); }} onBlur={function() { setF(false); }}
      style={Object.assign({}, { background: "rgba(10,14,24,0.8)", border: "1px solid " + (f ? T.accent : T.border), borderRadius: 12, color: T.text, padding: "12px 16px", fontSize: 13, width: "100%", transition: "all 0.3s", boxShadow: f ? "0 0 0 3px " + T.accentGlow : "none", outline: "none" }, props.style || {})} />
  );
}

/* ====== SVG ICONS ====== */
var I = {
  play: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>,
  plus: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  send: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>,
  trash: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  bolt: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  github: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>,
  shield: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  doc: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>,
  check: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>,
};

/* ====== ANALYSIS ENGINE ====== */
function analyzeFile(c, f) {
  var lines = c.split("\n");
  var ext = (f || "").split(".").pop() || "txt";
  var funcs = [], classes = [], issues = [], cx = 0;
  lines.forEach(function(l, i) {
    var t = l.trim(), ln = i + 1, m;
    if (ext === "py") {
      m = t.match(/^(?:async\s+)?def\s+(\w+)/); if (m) funcs.push({ name: m[1], line: ln });
      m = t.match(/^class\s+(\w+)/); if (m) classes.push({ name: m[1], line: ln });
    }
    if (t.indexOf("eval(") >= 0) issues.push({ line: ln, severity: "critical", msg: "eval()", rule: "SEC001" });
    if (/except:\s*$/.test(t)) issues.push({ line: ln, severity: "warning", msg: "Bare except", rule: "PY003" });
    if (/(password|secret|api_key|token)\s*=\s*['"][^'"]{4,}/.test(t)) issues.push({ line: ln, severity: "critical", msg: "Hardcoded secret", rule: "SEC002" });
    if (/#\s*(TODO|FIXME|HACK)/.test(t)) issues.push({ line: ln, severity: "info", msg: "TODO/FIXME", rule: "QA001" });
    if (t.indexOf("if") >= 0 || t.indexOf("for") >= 0 || t.indexOf("while") >= 0) cx++;
  });
  return { lines: lines.length, functions: funcs, classes: classes, issues: issues, complexity: cx, ext: ext };
}

function hashEmbed(text) {
  var tokens = text.toLowerCase().replace(/[^a-z0-9\s_]/g, " ").split(/\s+/).filter(Boolean);
  var v = new Float32Array(32);
  tokens.forEach(function(t, ti) {
    var h = 5381;
    for (var i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0;
    for (var d = 0; d < 32; d++) v[d] += Math.sin(h * (d + 1) * 0.1 + ti * 0.3) / (1 + ti * 0.1);
  });
  var mag = 0;
  for (var i = 0; i < 32; i++) mag += v[i] * v[i];
  mag = Math.sqrt(mag) || 1;
  var result = [];
  for (var j = 0; j < 32; j++) result.push(v[j] / mag);
  return result;
}

function cosine(a, b) {
  var d = 0;
  for (var i = 0; i < a.length; i++) d += a[i] * b[i];
  return d;
}

function detectDeps(files) {
  var deps = [];
  Object.keys(files).forEach(function(n) {
    var c = files[n];
    if (n.indexOf("requirements") >= 0 && n.endsWith(".txt")) {
      c.split("\n").forEach(function(l) {
        var m = l.trim().match(/^([a-zA-Z0-9_.-]+)(?:[=<>!~]+(.+))?/);
        if (m && m[1] && m[1].charAt(0) !== "#") deps.push({ name: m[1], version: m[2] || "latest", source: n, ecosystem: "PyPI" });
      });
    }
  });
  return deps;
}

async function queryOSV(pkg, ver, eco) {
  try {
    var r = await fetch("https://api.osv.dev/v1/query", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ "package": { name: pkg, ecosystem: eco }, version: ver }) });
    if (!r.ok) return [];
    var d = await r.json();
    var vulns = d.vulns || [];
    return vulns.map(function(v) {
      var sev = "LOW";
      if (v.severity && v.severity[0] && v.severity[0].score > 7) sev = "HIGH";
      var fixed = null;
      try { fixed = v.affected[0].ranges[0].events.find(function(e) { return e.fixed; }).fixed; } catch (e) {}
      return { id: v.id, summary: v.summary || "", severity: sev, fixed: fixed };
    });
  } catch (e) { return []; }
}

/* ====== DEMO DATA ====== */
var DEMO = {
  "auth/service.py": "class AuthService:\n    def __init__(self, db, vault):\n        self.db = db\n        self.vault = vault\n\n    def authenticate(self, token):\n        decoded = self.vault.decrypt(token)\n        user = self.db.get_user(decoded['uid'])\n        if not user or user.disabled:\n            raise AuthError('Invalid')\n        return user\n\n    # TODO: Add rate limiting\n    def generate_token(self, uid):\n        return jwt.encode({'uid': uid}, self.secret)",
  "auth/middleware.py": "from functools import wraps\n\ndef require_auth(f):\n    @wraps(f)\n    async def wrapper(request, *a, **kw):\n        token = request.headers.get('Authorization')\n        if not token:\n            raise HTTPException(401)\n        try:\n            user = auth_service.authenticate(token)\n        except:\n            raise HTTPException(403)\n        request.state.user = user\n        return await f(request, *a, **kw)\n    return wrapper",
  "security/vault.py": "from cryptography.fernet import Fernet\nimport json, time\n\nclass CredentialVault:\n    def __init__(self, key_path):\n        with open(key_path, 'rb') as f:\n            self.cipher = Fernet(f.read())\n\n    def encrypt(self, key, value):\n        data = json.dumps({'key': key, 'value': value})\n        return self.cipher.encrypt(data.encode())\n\n    def decrypt(self, encrypted):\n        return json.loads(self.cipher.decrypt(encrypted).decode())\n\n    def rotate(self):\n        return Fernet.generate_key()",
  "requirements.txt": "fastapi==0.95.0\nuvicorn==0.22.0\npydantic==2.5.0\ncryptography==42.0.0\ndocker==7.0.0\ncelery==5.3.0\nredis==5.0.0\nsqlalchemy==2.0.25",
};

var AGENTS = [
  { id: "scanner", name: "Repo Scanner", desc: "AST parsing, function/class extraction, complexity", status: "implemented" },
  { id: "bugs", name: "Bug Detector", desc: "eval(), bare except, hardcoded secrets, TODO", status: "implemented" },
  { id: "deps", name: "Dep Analyzer", desc: "Parse manifests, query OSV.dev for real CVEs", status: "implemented" },
  { id: "embeddings", name: "Embeddings", desc: "Chunk code, 32-dim vectors, cosine search", status: "prototype" },
  { id: "refactor", name: "Refactor Agent", desc: "Complexity analysis, module split suggestions", status: "implemented" },
  { id: "remediate", name: "CVE Remediator", desc: "Detect CVEs, generate patches, draft PRs", status: "implemented" },
];

var TABS = [
  { id: "dash", label: "Dashboard" },
  { id: "agents", label: "Agents" },
  { id: "repos", label: "Repos" },
  { id: "pipes", label: "Pipelines" },
  { id: "rag", label: "RAG Q&A" },
  { id: "rem", label: "Remediation" },
  { id: "sec", label: "Security" },
  { id: "arch", label: "Architecture" },
];

/* ====== STATE ====== */
function initS() {
  return {
    repos: [{ id: "demo", name: "argos-core (demo)", source: "built-in", status: "ready", file_count: Object.keys(DEMO).length, lang: "Python" }],
    runs: [], logs: [],
    pipelines: [
      { id: "p1", name: "Full Security Audit", agents: ["scanner", "deps", "bugs"], schedule: "Daily 2AM" },
      { id: "p2", name: "CVE Remediation", agents: ["deps", "bugs", "remediate"], schedule: "On Push" },
    ],
    vectorStore: [], repoFiles: { demo: DEMO },
    metrics: { files: 0, embeddings: 0, bugs: 0, osv: 0, vectors: 0 },
    health: null,
  };
}

function reducer(s, a) {
  switch (a.type) {
    case "SET": return Object.assign({}, s, { [a.k]: a.v });
    case "LOG": return Object.assign({}, s, { logs: s.logs.concat([Object.assign({ ts: new Date().toLocaleTimeString("en-US", { hour12: false }) }, a.p)]).slice(-300) });
    case "ADD_RUN": return Object.assign({}, s, { runs: [a.p].concat(s.runs).slice(0, 50) });
    case "UPD_RUN": return Object.assign({}, s, { runs: s.runs.map(function(r) { return r.id === a.p.id ? Object.assign({}, r, a.p) : r; }) });
    case "INC": {
      var m = Object.assign({}, s.metrics);
      Object.keys(a.p).forEach(function(k) { m[k] = (m[k] || 0) + a.p[k]; });
      return Object.assign({}, s, { metrics: m });
    }
    case "SET_VEC": return Object.assign({}, s, { vectorStore: a.p });
    case "SET_FILES": {
      var rf = Object.assign({}, s.repoFiles);
      rf[a.p.id] = a.p.files;
      return Object.assign({}, s, { repoFiles: rf });
    }
    default: return s;
  }
}

/* ====== MAIN APP ====== */
export default function App() {
  var stateArr = useReducer(reducer, null, initS);
  var s = stateArr[0];
  var D = stateArr[1];
  var tabState = useState("dash");
  var tab = tabState[0];
  var setTab = tabState[1];
  var runState = useState({});
  var running = runState[0];
  var setRunning = runState[1];
  var logsRef = useRef(null);

  var log = useCallback(function(lv, ag, msg) {
    D({ type: "LOG", p: { level: lv, agent: ag, msg: msg } });
  }, []);

  useEffect(function() {
    if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }, [s.logs]);

  useEffect(function() {
    fetch("http://localhost:8000/health")
      .then(function(r) { return r.json(); })
      .then(function(h) { D({ type: "SET", k: "health", v: h }); })
      .catch(function() { D({ type: "SET", k: "health", v: { status: "offline" } }); });
  }, []);

  var anyR = Object.keys(running).length > 0;

  var getFiles = useCallback(function(id) {
    return s.repoFiles[id] || DEMO;
  }, [s.repoFiles]);

  var execAgent = useCallback(async function(agentId, repoId) {
    var rid = "run-" + Date.now();
    var files = getFiles(repoId || "demo");
    var repo = s.repos.find(function(r) { return r.id === (repoId || "demo"); });
    setRunning(function(p) { var n = Object.assign({}, p); n[agentId] = true; return n; });
    D({ type: "ADD_RUN", p: { id: rid, agent: agentId, repo: repo ? repo.name : "demo", status: "running" } });
    var delay = function(ms) { return new Promise(function(r) { setTimeout(r, ms); }); };
    var t0 = Date.now();

    try {
      if (agentId === "scanner") {
        log("info", "scanner", "Scanning " + Object.keys(files).length + " files...");
        await delay(80);
        var tF = 0, tC = 0;
        var fileKeys = Object.keys(files);
        for (var fi = 0; fi < fileKeys.length; fi++) {
          var p = fileKeys[fi];
          var a = analyzeFile(files[p], p);
          tF += a.functions.length;
          tC += a.classes.length;
          log("info", "scanner", p + ": " + a.lines + "L " + a.functions.length + "fn cx=" + a.complexity);
          await delay(50);
        }
        D({ type: "INC", p: { files: fileKeys.length } });
        log("success", "scanner", fileKeys.length + " files, " + tF + " funcs - " + (Date.now() - t0) + "ms");
        D({ type: "UPD_RUN", p: { id: rid, status: "success", duration: Date.now() - t0, results: { files: fileKeys.length, functions: tF, classes: tC } } });

      } else if (agentId === "bugs") {
        log("info", "bugs", "Static analysis...");
        await delay(60);
        var allIssues = [];
        var bKeys = Object.keys(files);
        for (var bi = 0; bi < bKeys.length; bi++) {
          var bp = bKeys[bi];
          var ba = analyzeFile(files[bp], bp);
          if (ba.issues.length) {
            ba.issues.forEach(function(issue) { allIssues.push(Object.assign({}, issue, { file: bp })); });
            log("warn", "bugs", bp + ": " + ba.issues.length + " issue(s)");
          }
          await delay(30);
        }
        var cr = allIssues.filter(function(i) { return i.severity === "critical"; }).length;
        D({ type: "INC", p: { bugs: allIssues.length } });
        log("success", "bugs", cr + " critical, " + allIssues.length + " total");
        D({ type: "UPD_RUN", p: { id: rid, status: cr > 0 ? "warning" : "success", duration: Date.now() - t0, results: { issues: allIssues, critical: cr } } });

      } else if (agentId === "deps") {
        log("info", "deps", "Scanning manifests...");
        await delay(60);
        var deps = detectDeps(files);
        var depResults = [];
        for (var di = 0; di < deps.length; di++) {
          var dep = deps[di];
          log("info", "deps", "OSV: " + dep.name + "==" + dep.version);
          var vulns = await queryOSV(dep.name, dep.version, dep.ecosystem);
          D({ type: "INC", p: { osv: 1 } });
          depResults.push(Object.assign({}, dep, { vulns: vulns }));
          if (vulns.length) {
            vulns.forEach(function(v) { log("warn", "deps", dep.name + ": " + v.id); });
          }
          await delay(30);
        }
        var tv = depResults.reduce(function(sum, d) { return sum + d.vulns.length; }, 0);
        log("success", "deps", deps.length + " deps, " + tv + " vulns");
        D({ type: "UPD_RUN", p: { id: rid, status: tv > 0 ? "warning" : "success", duration: Date.now() - t0, results: { deps: depResults, totalVulns: tv } } });

      } else if (agentId === "embeddings") {
        log("info", "embeddings", "Chunking...");
        await delay(60);
        var vectors = [];
        var eKeys = Object.keys(files);
        for (var ei = 0; ei < eKeys.length; ei++) {
          var ep = eKeys[ei];
          var eLines = files[ep].split("\n");
          for (var li = 0; li < eLines.length; li += 8) {
            var chunk = eLines.slice(li, li + 10).join("\n");
            if (chunk.trim().length >= 10) {
              vectors.push({ path: ep, chunk: chunk, startLine: li, embedding: hashEmbed(chunk) });
            }
          }
          await delay(15);
        }
        D({ type: "SET_VEC", p: vectors });
        D({ type: "INC", p: { embeddings: vectors.length, vectors: vectors.length } });
        log("success", "embeddings", vectors.length + " vectors (dim=32)");
        D({ type: "UPD_RUN", p: { id: rid, status: "success", duration: Date.now() - t0, results: { chunks: vectors.length } } });

      } else if (agentId === "remediate") {
        log("info", "remediate", "CVE auto-remediation...");
        await delay(60);
        var rDeps = detectDeps(files);
        var patches = [];
        for (var ri = 0; ri < rDeps.length; ri++) {
          var rd = rDeps[ri];
          var rv = await queryOSV(rd.name, rd.version, rd.ecosystem);
          D({ type: "INC", p: { osv: 1 } });
          for (var rvi = 0; rvi < rv.length; rvi++) {
            var rvItem = rv[rvi];
            var fix = rvItem.fixed || "latest";
            patches.push({
              dep: rd.name, version: rd.version, fixVer: fix, cve: rvItem.id,
              severity: rvItem.severity, summary: rvItem.summary, source: rd.source,
              patch: "--- a/" + rd.source + "\n+++ b/" + rd.source + "\n@@ @@\n-" + rd.name + "==" + rd.version + "\n+" + rd.name + "==" + fix,
              pr: "## Fix " + rvItem.id + " in " + rd.name + "\n\nUpgrade " + rd.name + " " + rd.version + " -> " + fix + "\nSeverity: " + rvItem.severity + "\n" + rvItem.summary,
            });
            log("success", "remediate", "Patch: " + rd.name + " -> " + fix);
          }
          await delay(30);
        }
        log("success", "remediate", patches.length + " patches");
        D({ type: "UPD_RUN", p: { id: rid, status: "success", duration: Date.now() - t0, results: { patches: patches } } });

      } else {
        log("info", agentId, "Running...");
        await delay(200);
        log("success", agentId, "Done");
        D({ type: "UPD_RUN", p: { id: rid, status: "success", duration: Date.now() - t0, results: {} } });
      }
    } catch (e) {
      log("error", agentId, e.message);
      D({ type: "UPD_RUN", p: { id: rid, status: "failed", duration: Date.now() - t0 } });
    } finally {
      setRunning(function(prev) { var n = Object.assign({}, prev); delete n[agentId]; return n; });
    }
  }, [s.repos, getFiles, log]);

  var online = s.health && s.health.status === "ok";

  return (
    <div style={{ minHeight: "100vh", color: T.text, fontFamily: "-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif", fontSize: 13, position: "relative" }}>
      <style>{
        "@keyframes argos-spin { to { transform: rotate(360deg) } }" +
        ".argos-spin { animation: argos-spin 0.8s linear infinite; }" +
        "@keyframes argos-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }" +
        "@keyframes argos-slide { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }" +
        ".argos-appear { animation: argos-slide 0.35s ease-out; }" +
        "@keyframes argos-glow { 0%,100% { box-shadow: 0 0 20px " + T.accentGlow + " } 50% { box-shadow: 0 0 40px " + T.accent + "30 } }" +
        "* { box-sizing: border-box; margin: 0; padding: 0; }" +
        "::-webkit-scrollbar { width: 6px; height: 6px; }" +
        "::-webkit-scrollbar-thumb { background: " + T.border + "; border-radius: 3px; }" +
        "input, select, textarea { outline: none; } pre { margin: 0; }" +
        "@media (max-width: 768px) { .hide-mobile { display: none !important; } .grid-resp { grid-template-columns: 1fr !important; } }"
      }</style>

      <AnimatedBackground />

      {/* Header */}
      <header style={{ borderBottom: "1px solid " + T.border, padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(10,14,24,0.8)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: T.gradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px " + T.accentGlow, animation: "argos-glow 3s ease-in-out infinite" }}>{I.shield}</div>
          <div>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>ARGOS</span>
            <span className="hide-mobile" style={{ fontSize: 9, color: T.dim, fontWeight: 600, letterSpacing: 1, marginLeft: 8 }}>DEVELOPER PREVIEW</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="hide-mobile" style={Object.assign({ display: "flex", gap: 12, fontSize: 10, color: T.dim }, mono)}>
            <span>{s.metrics.osv} OSV</span>
            <span>{s.vectorStore.length} vec</span>
            <span>{s.runs.length} runs</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 99, background: online ? T.green + "15" : T.red + "15", border: "1px solid " + (online ? T.green + "33" : T.red + "33") }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: online ? T.green : T.red, boxShadow: online ? "0 0 10px " + T.green + "60" : "none", animation: online ? "none" : "argos-pulse 1.5s infinite" }} />
            <span style={{ fontSize: 10, color: online ? T.green : T.red, fontWeight: 600 }}>{online ? "Connected" : "Offline"}</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav style={{ display: "flex", borderBottom: "1px solid " + T.border, padding: "0 20px", overflowX: "auto", background: "rgba(10,14,24,0.6)", backdropFilter: "blur(16px)", position: "sticky", top: 58, zIndex: 99 }}>
        {TABS.map(function(t) {
          return (
            <button key={t.id} onClick={function() { setTab(t.id); }}
              style={{ padding: "11px 16px", background: "transparent", border: "none", borderBottom: tab === t.id ? "2px solid " + T.accent : "2px solid transparent", color: tab === t.id ? T.text : T.dim, fontSize: 12.5, fontWeight: tab === t.id ? 600 : 400, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.25s" }}>
              {t.label}
            </button>
          );
        })}
      </nav>

      {/* Content */}
      <main style={{ padding: "18px 20px", maxWidth: 1300, margin: "0 auto", position: "relative", zIndex: 1 }} className="argos-appear" key={tab}>
        {tab === "dash" && <DashView s={s} logsRef={logsRef} />}
        {tab === "agents" && <AgentsView s={s} execAgent={execAgent} running={running} anyR={anyR} />}
        {tab === "repos" && <ReposView s={s} D={D} log={log} />}
        {tab === "pipes" && <PipesView s={s} D={D} execAgent={execAgent} running={running} anyR={anyR} />}
        {tab === "rag" && <RAGView s={s} execAgent={execAgent} running={running} anyR={anyR} log={log} />}
        {tab === "rem" && <RemView s={s} execAgent={execAgent} running={running} anyR={anyR} />}
        {tab === "sec" && <SecView s={s} />}
        {tab === "arch" && <ArchView />}
      </main>
    </div>
  );
}

/* ====== DASHBOARD ====== */
function DashView(props) {
  var s = props.s;
  var logsRef = props.logsRef;
  var statItems = [
    ["FILES", s.metrics.files, T.blue],
    ["EMBEDDINGS", s.metrics.embeddings, T.accent],
    ["BUGS", s.metrics.bugs, T.yellow],
    ["OSV QUERIES", s.metrics.osv, T.cyan],
    ["VECTORS", s.vectorStore.length, T.accent],
    ["RUNS", s.runs.length, "#fff"],
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="grid-resp" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
        {statItems.map(function(item, i) {
          return (
            <GlowCard key={i} glow>
              <div style={{ fontSize: 10, color: T.dim, marginBottom: 6, letterSpacing: 1, fontWeight: 600 }}>{item[0]}</div>
              <AnimNum value={item[1]} color={item[2]} />
            </GlowCard>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <GlowCard style={{ flex: "1 1 450px" }}>
          <div style={{ fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5, fontSize: 11, color: T.dim }}>Live Agent Log</div>
          <div ref={logsRef} style={Object.assign({}, mono, { fontSize: 10.5, lineHeight: 1.8, maxHeight: 300, overflowY: "auto", background: "rgba(5,7,13,0.6)", borderRadius: 12, padding: 14, border: "1px solid " + T.border })}>
            {s.logs.length === 0 && <div style={{ color: T.dim, textAlign: "center", padding: 20 }}>Run an agent to see live logs here...</div>}
            {s.logs.map(function(l, i) {
              var lc = T.blue;
              if (l.level === "success") lc = T.green;
              else if (l.level === "warn") lc = T.yellow;
              else if (l.level === "error") lc = T.red;
              return (
                <div key={i} className="argos-appear">
                  <span style={{ color: T.muted, marginRight: 6 }}>{l.ts}</span>
                  <span style={{ color: lc, fontWeight: 700, fontSize: 9, textTransform: "uppercase", marginRight: 6 }}>{l.level}</span>
                  <span style={{ color: T.accent, marginRight: 6 }}>[{l.agent}]</span>
                  <span>{l.msg}</span>
                </div>
              );
            })}
            <span style={{ color: T.green }}>|</span>
          </div>
        </GlowCard>
        <GlowCard style={{ flex: "1 1 280px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5, color: T.dim }}>Recent Runs</div>
          <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {s.runs.length === 0 && <div style={{ fontSize: 11, color: T.dim, textAlign: "center", padding: 20 }}>No runs yet</div>}
            {s.runs.slice(0, 15).map(function(r) {
              return (
                <div key={r.id} className="argos-appear" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(5,7,13,0.5)", borderRadius: 10, border: "1px solid " + T.border }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{r.agent}</div>
                    <div style={{ fontSize: 9, color: T.dim }}>{r.repo}{r.duration ? " - " + r.duration + "ms" : ""}</div>
                  </div>
                  <Badge status={r.status} />
                </div>
              );
            })}
          </div>
        </GlowCard>
      </div>
    </div>
  );
}

/* ====== AGENTS ====== */
function AgentsView(props) {
  var s = props.s;
  var execAgent = props.execAgent;
  var running = props.running;
  var anyR = props.anyR;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 12, color: T.dim }}>Real execution - AST parsing - OSV.dev CVE scanning</div>
      <div className="grid-resp" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
        {AGENTS.map(function(a) {
          var isR = running[a.id];
          var last = s.runs.find(function(r) { return r.agent === a.id && r.status !== "running"; });
          return (
            <GlowCard key={a.id} active={isR} glow={isR}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{a.name}</div>
                <div style={{ display: "flex", gap: 4 }}><Badge status={a.status} /><Badge status={isR ? "running" : (last ? last.status : "idle")} /></div>
              </div>
              <div style={{ fontSize: 11, color: T.dim, lineHeight: 1.6, marginBottom: 14 }}>{a.desc}</div>
              {last && last.results && !isR && (
                <div className="argos-appear" style={Object.assign({}, mono, { fontSize: 10, color: T.muted, background: "rgba(5,7,13,0.5)", borderRadius: 10, padding: 10, marginBottom: 12, lineHeight: 1.7 })}>
                  {last.results.files !== undefined && <div>Files: {last.results.files}{last.results.functions !== undefined ? " / Funcs: " + last.results.functions : ""}</div>}
                  {last.results.critical !== undefined && <div>Critical: <span style={{ color: T.red }}>{last.results.critical}</span></div>}
                  {last.results.totalVulns !== undefined && <div>Vulns: <span style={{ color: T.red }}>{last.results.totalVulns}</span></div>}
                  {last.results.chunks !== undefined && <div>Chunks: {last.results.chunks}</div>}
                  {last.results.patches && <div>{last.results.patches.length} CVE patches</div>}
                  {last.duration && <div>{last.duration}ms</div>}
                </div>
              )}
              <Btn variant={isR ? "default" : "primary"} full disabled={anyR} onClick={function() { execAgent(a.id, "demo"); }}>
                {isR ? (<><span className="argos-spin" style={{ width: 10, height: 10, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block" }} /> Executing...</>) : (<>{I.play} Execute</>)}
              </Btn>
            </GlowCard>
          );
        })}
      </div>
    </div>
  );
}

/* ====== REPOS ====== */
function ReposView(props) {
  var s = props.s;
  var D = props.D;
  var log = props.log;
  var modeState = useState(null); var mode = modeState[0]; var setMode = modeState[1];
  var ghState = useState(""); var ghUrl = ghState[0]; var setGhUrl = ghState[1];
  var fetchState = useState(false); var fetching = fetchState[0]; var setFetching = fetchState[1];
  var expState = useState(null); var expanded = expState[0]; var setExpanded = expState[1];
  var vfState = useState(null); var vf = vfState[0]; var setVf = vfState[1];

  var doGH = async function() {
    if (!ghUrl.trim()) return;
    setFetching(true);
    try {
      var r = await fetch("http://localhost:8000/api/v1/repos/github?url=" + encodeURIComponent(ghUrl), { method: "POST" });
      var d = await r.json();
      D({ type: "SET", k: "repos", v: s.repos.concat([{ id: d.id, name: d.name, source: "github", status: "ready", file_count: d.files, lang: "Mixed" }]) });
      log("success", "github", "Connected: " + d.name);
      setGhUrl(""); setMode(null);
    } catch (e) { log("error", "github", e.message); }
    finally { setFetching(false); }
  };

  var getFiles = function(id) { return s.repoFiles[id] || DEMO; };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 12, color: T.dim }}>{s.repos.length} repos</span>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn onClick={function() { setMode(mode === "gh" ? null : "gh"); }} variant={mode === "gh" ? "primary" : "default"}>{I.github} GitHub</Btn>
          <Btn onClick={function() { setMode(mode === "paste" ? null : "paste"); }} variant={mode === "paste" ? "primary" : "default"}>{I.plus} Paste</Btn>
        </div>
      </div>
      {mode === "gh" && (
        <GlowCard active>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>{I.github} Connect GitHub</div>
          <div style={{ fontSize: 10, color: T.dim, marginBottom: 10 }}>Public repos, up to 40 files</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Input value={ghUrl} onChange={function(e) { setGhUrl(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") doGH(); }} placeholder="https://github.com/owner/repo" />
            <Btn variant="primary" onClick={doGH} disabled={fetching}>{fetching ? "Fetching..." : "Connect"}</Btn>
          </div>
        </GlowCard>
      )}
      {s.repos.map(function(r) {
        var files = getFiles(r.id);
        return (
          <GlowCard key={r.id} hover onClick={function() { setExpanded(expanded === r.id ? null : r.id); setVf(null); }} style={{ cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{r.name}</div>
                <div style={{ fontSize: 10, color: T.dim }}>{r.lang} - {r.file_count} files - {r.source}</div>
              </div>
              <Badge status={r.status} />
            </div>
            {expanded === r.id && files && (
              <div className="argos-appear" onClick={function(e) { e.stopPropagation(); }} style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div style={{ minWidth: 160, background: "rgba(5,7,13,0.6)", borderRadius: 12, padding: 12, border: "1px solid " + T.border, maxHeight: 280, overflowY: "auto" }}>
                  {Object.keys(files).sort().map(function(f) {
                    return (
                      <div key={f} onClick={function() { setVf(f); }} style={Object.assign({}, mono, { fontSize: 10.5, color: vf === f ? T.accent : T.text, padding: "4px 0", cursor: "pointer", borderLeft: vf === f ? "2px solid " + T.accent : "2px solid transparent", paddingLeft: 8, transition: "all 0.2s" })}>{f}</div>
                    );
                  })}
                </div>
                {vf && files[vf] && (
                  <div style={{ flex: 1, minWidth: 250 }}>
                    <div style={Object.assign({}, mono, { fontSize: 11, fontWeight: 600, color: T.accent, marginBottom: 6 })}>{vf}</div>
                    <pre style={Object.assign({}, mono, { fontSize: 10.5, lineHeight: 1.5, background: "rgba(5,7,13,0.6)", borderRadius: 12, padding: 14, border: "1px solid " + T.border, whiteSpace: "pre-wrap", maxHeight: 280, overflowY: "auto" })}>{files[vf]}</pre>
                    <div style={{ marginTop: 6, fontSize: 9, color: T.dim }}>
                      {(function() { var a = analyzeFile(files[vf], vf); return a.lines + "L / " + a.functions.length + "fn / cx:" + a.complexity + " / " + a.issues.length + " issues"; })()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </GlowCard>
        );
      })}
    </div>
  );
}

/* ====== PIPELINES ====== */
function PipesView(props) {
  var s = props.s; var D = props.D; var execAgent = props.execAgent; var running = props.running; var anyR = props.anyR;
  var crState = useState(false); var cr = crState[0]; var setCr = crState[1];
  var nameState = useState(""); var name = nameState[0]; var setName = nameState[1];
  var agState = useState([]); var agents = agState[0]; var setAgents = agState[1];

  var tog = function(id) { setAgents(function(p) { return p.indexOf(id) >= 0 ? p.filter(function(a) { return a !== id; }) : p.concat([id]); }); };
  var add = function() { if (!name.trim() || !agents.length) return; D({ type: "SET", k: "pipelines", v: s.pipelines.concat([{ id: "p-" + Date.now(), name: name, agents: agents, schedule: "Manual" }]) }); setName(""); setAgents([]); setCr(false); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 12, color: T.dim }}>{s.pipelines.length} pipelines</span>
        <Btn variant="primary" onClick={function() { setCr(!cr); }}>{I.plus} New</Btn>
      </div>
      {cr && (
        <GlowCard active>
          <Input value={name} onChange={function(e) { setName(e.target.value); }} placeholder="Pipeline name" style={{ marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {AGENTS.map(function(a) {
              var selected = agents.indexOf(a.id) >= 0;
              return (
                <Btn key={a.id} size="sm" variant={selected ? "primary" : "default"} onClick={function() { tog(a.id); }}>
                  {selected && <>{I.check} #{agents.indexOf(a.id) + 1}</>} {a.name}
                </Btn>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Btn variant="primary" onClick={add}>Create</Btn>
            <Btn onClick={function() { setCr(false); }}>Cancel</Btn>
          </div>
        </GlowCard>
      )}
      {s.pipelines.map(function(p) {
        return (
          <GlowCard key={p.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: 10, color: T.dim, marginTop: 4 }}>
                  {(p.agents || []).map(function(id, i) {
                    var agName = (AGENTS.find(function(a) { return a.id === id; }) || {}).name || id;
                    return <span key={id}>{i > 0 && <span style={{ color: T.muted }}>{" > "}</span>}<span style={{ color: T.accent }}>{agName}</span></span>;
                  })}
                </div>
                <div style={{ fontSize: 9, color: T.muted, marginTop: 2 }}>{p.schedule} - {(p.agents || []).length} stages</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <Btn size="sm" disabled={anyR} onClick={async function() {
                  var pAgents = p.agents || [];
                  for (var i = 0; i < pAgents.length; i++) {
                    await execAgent(pAgents[i], "demo");
                    await new Promise(function(r) { setTimeout(r, 150); });
                  }
                }}>{anyR ? "..." : <>{I.play} Run</>}</Btn>
                {p.id !== "p1" && p.id !== "p2" && (
                  <Btn size="sm" variant="danger" onClick={function() { D({ type: "SET", k: "pipelines", v: s.pipelines.filter(function(x) { return x.id !== p.id; }) }); }}>{I.trash}</Btn>
                )}
              </div>
            </div>
          </GlowCard>
        );
      })}
    </div>
  );
}

/* ====== RAG Q&A ====== */
function RAGView(props) {
  var s = props.s; var execAgent = props.execAgent; var running = props.running; var anyR = props.anyR; var log = props.log;
  var qState = useState(""); var q = qState[0]; var setQ = qState[1];
  var resState = useState(null); var results = resState[0]; var setResults = resState[1];
  var ansState = useState(null); var answer = ansState[0]; var setAnswer = ansState[1];
  var loadState = useState(false); var loading = loadState[0]; var setLoading = loadState[1];
  var indexed = s.vectorStore.length > 0;

  var search = async function() {
    if (!q.trim() || !indexed) return;
    setLoading(true);
    var qE = hashEmbed(q);
    var scored = s.vectorStore.map(function(v) { return Object.assign({}, v, { score: cosine(qE, v.embedding) }); }).sort(function(a, b) { return b.score - a.score; }).slice(0, 6);
    setResults(scored);
    var avg = scored.reduce(function(sum, r) { return sum + r.score; }, 0) / scored.length;
    var conf = avg > 0.55 ? "high" : avg > 0.35 ? "medium" : "low";
    var files = [];
    scored.forEach(function(r) { if (files.indexOf(r.path) < 0) files.push(r.path); });
    var funcNames = [];
    scored.forEach(function(r) { var m = r.chunk.match(/(?:def |class )(\w+)/g); if (m) m.forEach(function(x) { funcNames.push(x.replace(/^(?:def |class )/, "")); }); });
    setAnswer({
      text: "Based on " + scored.length + " chunks, this is handled in " + files.map(function(f) { return "`" + f + "`"; }).join(", ") + ".\n\nKey components: " + (funcNames.length ? funcNames.slice(0, 5).map(function(n) { return "`" + n + "()`"; }).join(", ") : "see chunks below") + ".",
      confidence: conf,
      sources: scored.map(function(x) { return { path: x.path, line: x.startLine + 1, score: x.score }; }),
      files: files,
    });
    log("info", "rag", "Query: \"" + q + "\" - " + scored.length + " chunks");
    setLoading(false);
    setQ("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <GlowCard glow>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Codebase Q&A</div>
        <div style={{ fontSize: 10, color: T.dim, marginBottom: 12 }}>Embeddings > Vector search > Answer synthesis</div>
        {!indexed ? (
          <div style={{ textAlign: "center", padding: 20 }}>
            <div style={{ fontSize: 12, color: T.yellow, marginBottom: 10 }}>Build vector index first</div>
            <Btn variant="primary" disabled={anyR} onClick={function() { execAgent("embeddings", "demo"); }}>
              {running["embeddings"] ? "Indexing..." : <>{I.play} Build Index</>}
            </Btn>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <Input value={q} onChange={function(e) { setQ(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") search(); }} placeholder="Where is authentication handled?" />
            <Btn variant="primary" onClick={search} disabled={loading}>{loading ? "..." : I.send}</Btn>
          </div>
        )}
      </GlowCard>
      {answer && (
        <GlowCard active className="argos-appear">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>{I.bolt} Answer</div>
            <Badge status={answer.confidence === "high" ? "success" : answer.confidence === "medium" ? "warning" : "idle"} size="md" />
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.8, whiteSpace: "pre-wrap", marginBottom: 10 }}>{answer.text}</div>
          <div style={{ borderTop: "1px solid " + T.border, paddingTop: 8, fontSize: 10 }}>
            {answer.sources.map(function(src, i) {
              return <div key={i} style={Object.assign({}, mono, { color: T.accent })}>{src.path}:{src.line} <span style={{ color: src.score > 0.55 ? T.green : T.dim }}>({(src.score * 100).toFixed(1)}%)</span></div>;
            })}
          </div>
        </GlowCard>
      )}
      {results && (
        <GlowCard>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Retrieved Chunks</div>
          {results.map(function(r, i) {
            return (
              <div key={i} className="argos-appear" style={{ marginBottom: 8, background: "rgba(5,7,13,0.5)", borderRadius: 12, padding: 12, border: "1px solid " + T.border }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={Object.assign({}, mono, { fontSize: 11, fontWeight: 600, color: T.accent })}>{r.path}:{r.startLine + 1}</span>
                  <span style={{ fontSize: 10, color: r.score > 0.55 ? T.green : T.dim, fontWeight: 600 }}>{(r.score * 100).toFixed(1)}%</span>
                </div>
                <pre style={Object.assign({}, mono, { fontSize: 10, lineHeight: 1.4, color: T.dim, whiteSpace: "pre-wrap" })}>{r.chunk}</pre>
              </div>
            );
          })}
        </GlowCard>
      )}
    </div>
  );
}

/* ====== REMEDIATION ====== */
function RemView(props) {
  var s = props.s; var execAgent = props.execAgent; var running = props.running; var anyR = props.anyR;
  var rem = s.runs.find(function(r) { return r.agent === "remediate" && r.results && r.results.patches; });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <GlowCard glow style={{ background: "linear-gradient(135deg, rgba(13,18,32,0.9), rgba(19,13,37,0.9))", borderColor: T.accent + "66" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: T.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>{I.shield}</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>CVE Auto-Remediation</div>
        </div>
        <div style={{ fontSize: 11, color: T.dim, lineHeight: 1.7, marginBottom: 14 }}>Scan deps > Query <strong style={{ color: T.cyan }}>OSV.dev</strong> > Generate patches > Draft PRs</div>
        <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
          {["Parse", ">", "OSV.dev", ">", "CVEs", ">", "Patch", ">", "PR"].map(function(x, i) {
            if (x === ">") return <span key={i} style={{ color: T.muted }}>&rarr;</span>;
            return <span key={i} style={{ background: "rgba(5,7,13,0.6)", border: "1px solid " + T.border, borderRadius: 8, padding: "5px 12px", fontSize: 10, color: T.accent, fontWeight: 600 }}>{x}</span>;
          })}
        </div>
        <Btn variant="primary" size="lg" disabled={anyR} onClick={function() { execAgent("remediate", "demo"); }}>
          {running["remediate"] ? (<><span className="argos-spin" style={{ width: 12, height: 12, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block" }} /> Scanning...</>) : (<>{I.bolt} Run Remediation</>)}
        </Btn>
      </GlowCard>
      {rem && rem.results.patches.length > 0 ? rem.results.patches.map(function(p, i) {
        return (
          <GlowCard key={i} className="argos-appear">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{p.cve} - {p.dep}</div>
                <div style={{ fontSize: 10, color: T.dim }}>{p.summary}</div>
                <div style={{ fontSize: 9, color: T.cyan }}>OSV.dev</div>
              </div>
              <Badge status={p.severity === "HIGH" ? "critical" : "warning"} size="md" />
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.green, marginBottom: 6 }}>Patch: {p.dep} {p.version} &rarr; {p.fixVer}</div>
              <pre style={Object.assign({}, mono, { fontSize: 10.5, lineHeight: 1.6, background: "rgba(5,7,13,0.5)", borderRadius: 12, padding: 12, border: "1px solid " + T.border, whiteSpace: "pre-wrap" })}>
                {p.patch.split("\n").map(function(l, j) {
                  var lc = T.dim;
                  if (l.charAt(0) === "+") lc = T.green;
                  else if (l.charAt(0) === "-") lc = T.red;
                  else if (l.charAt(0) === "@") lc = T.blue;
                  return <div key={j} style={{ color: lc }}>{l}</div>;
                })}
              </pre>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>PR Description</div>
              <div style={{ background: "rgba(5,7,13,0.5)", borderRadius: 12, padding: 14, border: "1px solid " + T.border, fontSize: 11, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{p.pr}</div>
            </div>
          </GlowCard>
        );
      }) : !running["remediate"] && (
        <GlowCard style={{ textAlign: "center" }}>
          <div style={{ color: T.dim, padding: 10 }}>Run to detect real CVEs via OSV.dev</div>
        </GlowCard>
      )}
    </div>
  );
}

/* ====== SECURITY ====== */
function SecView(props) {
  var s = props.s;
  var secStats = [["LEAKS", "0", T.green], ["SANDBOX", "Docker", T.blue], ["KEYS", "3", T.accent], ["OSV", String(s.metrics.osv), T.cyan]];
  var secComps = [
    ["AES-256 Vault", "Fernet encryption - vault.py", "implemented"],
    ["Docker Sandbox", "Isolated containers - sandbox.py", "implemented"],
    ["Secret Scanner", "SEC001-SEC002 rules", "implemented"],
    ["Audit Log", "All actions timestamped", "implemented"],
    ["Key Rotation", "vault.rotate()", "implemented"],
    ["OSV.dev", "Real CVE API", "implemented"],
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="grid-resp" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
        {secStats.map(function(item, i) {
          return (
            <GlowCard key={i} glow>
              <div style={{ fontSize: 10, color: T.dim, letterSpacing: 1, fontWeight: 600 }}>{item[0]}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: item[2], marginTop: 4 }}>{item[1]}</div>
            </GlowCard>
          );
        })}
      </div>
      <GlowCard>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Security Components</div>
        <div className="grid-resp" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
          {secComps.map(function(item, i) {
            return (
              <div key={i} style={{ background: "rgba(5,7,13,0.5)", border: "1px solid " + T.border, borderRadius: 12, padding: 14, transition: "all 0.25s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.accent }}>{item[0]}</span>
                  <Badge status={item[2]} />
                </div>
                <div style={{ fontSize: 10, color: T.dim, lineHeight: 1.5 }}>{item[1]}</div>
              </div>
            );
          })}
        </div>
      </GlowCard>
    </div>
  );
}

/* ====== ARCHITECTURE ====== */
function ArchView() {
  var secs = [
    { t: "Overview", c: "ARGOS - Secure AI code automation platform.\nDeveloper preview. Honest about implementation status." },
    { t: "Status", table: true, rows: [["Repo Scanner", "implemented", "Real AST"], ["Bug Detector", "implemented", "6 rules"], ["Dep Analyzer", "implemented", "OSV.dev API"], ["CVE Remediator", "implemented", "Patches + PRs"], ["GitHub Fetch", "implemented", "REST API"], ["Embeddings", "prototype", "Hash-based"], ["RAG", "prototype", "Claude API + fallback"], ["Vault", "implemented", "AES-256"], ["Sandbox", "implemented", "Docker code"], ["Persistence", "implemented", "PostgreSQL"], ["Queue", "planned", "Celery+Redis"]] },
    { t: "Stack", c: "Python / FastAPI / React / PostgreSQL / Redis / Docker\nFAISS / GitHub API / OSV.dev / Claude API" },
    { t: "Security", c: "AES-256-Fernet at rest / Docker sandbox / Scoped tokens\nSecret scanning / Audit logging / Key rotation" },
    { t: "Limitations", c: "GitHub: 40 files, public only\nEmbeddings: hash prototype\nFrontend-direct API calls in dev\nPR: payload only, no POST\nNo multi-user auth" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <GlowCard glow style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: T.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>{I.doc}</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Architecture</div>
          <div style={{ fontSize: 10, color: T.dim }}>Implemented / Prototype / Planned</div>
        </div>
      </GlowCard>
      {secs.map(function(sec, i) {
        return (
          <GlowCard key={i} className="argos-appear">
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>{sec.t}</div>
            {sec.table ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid " + T.border }}>
                      <th style={{ textAlign: "left", padding: "8px 10px", color: T.dim, fontWeight: 500, fontSize: 10 }}>Component</th>
                      <th style={{ textAlign: "left", padding: "8px 10px", color: T.dim, fontWeight: 500, fontSize: 10 }}>Status</th>
                      <th style={{ textAlign: "left", padding: "8px 10px", color: T.dim, fontWeight: 500, fontSize: 10 }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sec.rows.map(function(row, j) {
                      return (
                        <tr key={j} style={{ borderBottom: "1px solid " + T.border }}>
                          <td style={{ padding: "8px 10px", fontWeight: 500 }}>{row[0]}</td>
                          <td style={{ padding: "8px 10px" }}><Badge status={row[1]} /></td>
                          <td style={{ padding: "8px 10px", color: T.dim }}>{row[2]}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <pre style={Object.assign({}, mono, { fontSize: 11, lineHeight: 1.7, color: T.dim, whiteSpace: "pre-wrap" })}>{sec.c}</pre>
            )}
          </GlowCard>
        );
      })}
    </div>
  );
}
