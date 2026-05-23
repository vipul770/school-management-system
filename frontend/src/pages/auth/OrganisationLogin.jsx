import React, { useState, useEffect, useRef } from "react";
import { apiFetch, readResponseData } from "../../services/api";
import logo from "../../assets/logo.png";

const ORG_CONTEXT_KEY = "org_context";

/* ─────────────────────────── Styles ─────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  :root {
    --ink:       #0a0a0f;
    --ink-muted: #4a4a5a;
    --ink-faint: #9090a8;
    --gold:      #c8a96e;
    --gold-dim:  #e8d5b0;
    --gold-glow: rgba(200,169,110,0.18);
    --teal:      #1a7f74;
    --teal-lt:   rgba(26,127,116,0.08);
    --red:       #c0392b;
    --border:    rgba(10,10,15,0.08);
    --border-md: rgba(10,10,15,0.13);
    --radius:    16px;
    --radius-sm: 10px;
    --font-serif: 'Instrument Serif', Georgia, serif;
    --font-sans:  'DM Sans', system-ui, sans-serif;
    --transition: 200ms cubic-bezier(0.4,0,0.2,1);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }

  /* ── Shell ── */
  .ol-shell {
    min-height: 100vh;
    background: var(--ink);
    display: grid;
    grid-template-columns: 1fr 460px;
    position: relative;
    overflow: hidden;
  }

  /* ── Background canvas ── */
  .ol-canvas {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  /* ── Diagonal stripe texture ── */
  .ol-shell::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: repeating-linear-gradient(
      -52deg,
      transparent,
      transparent 58px,
      rgba(255,255,255,0.018) 58px,
      rgba(255,255,255,0.018) 59px
    );
    pointer-events: none;
    z-index: 1;
  }

  /* ── Left panel ── */
  .ol-left {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 52px 64px;
  }

  .ol-logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .ol-logo-mark {
    width: 38px; height: 38px;
    border-radius: 9px;
    background: linear-gradient(135deg, var(--gold) 0%, #a87c40 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 20px rgba(200,169,110,0.4);
    flex-shrink: 0;
  }
  .ol-logo-mark svg { width: 19px; height: 19px; }
  .ol-logo-name {
    font-family: var(--font-serif);
    font-size: 19px;
    color: #fff;
    letter-spacing: -0.2px;
  }

  /* Hero text */
  .ol-hero { flex: 1; display: flex; flex-direction: column; justify-content: center; max-width: 540px; }

  .ol-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 24px;
    opacity: 0;
    animation: fadeUp 0.55s ease forwards 200ms;
  }
  .ol-eyebrow-line { width: 22px; height: 1px; background: var(--gold); opacity: 0.55; }
  .ol-eyebrow-text {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    color: var(--gold);
  }

  .ol-title {
    font-family: var(--font-serif);
    font-size: clamp(2.5rem, 4.5vw, 3.8rem);
    color: #fff;
    line-height: 1.06;
    letter-spacing: -1.5px;
    margin-bottom: 22px;
    opacity: 0;
    animation: fadeUp 0.6s ease forwards 300ms;
  }
  .ol-title em { color: var(--gold); font-style: italic; }

  .ol-sub {
    font-size: 14.5px;
    color: rgba(255,255,255,0.38);
    line-height: 1.7;
    max-width: 400px;
    margin-bottom: 44px;
    font-weight: 400;
    opacity: 0;
    animation: fadeUp 0.6s ease forwards 400ms;
  }

  /* Feature list */
  .ol-features { display: flex; flex-direction: column; gap: 13px; }
  .ol-feature {
    display: flex;
    align-items: center;
    gap: 13px;
    font-size: 13.5px;
    color: rgba(255,255,255,0.38);
    opacity: 0;
    animation: fadeUp 0.55s ease forwards;
  }
  .ol-feature-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--gold);
    opacity: 0.55;
    flex-shrink: 0;
  }

  /* Stats row */
  .ol-stats {
    display: flex;
    gap: 32px;
    padding-top: 32px;
    border-top: 1px solid rgba(255,255,255,0.05);
    margin-top: 44px;
    opacity: 0;
    animation: fadeUp 0.6s ease forwards 850ms;
  }
  .ol-stat-val {
    font-family: var(--font-serif);
    font-size: 1.7rem;
    color: var(--gold);
    letter-spacing: -0.5px;
    line-height: 1;
    margin-bottom: 4px;
  }
  .ol-stat-label {
    font-size: 11px;
    color: rgba(255,255,255,0.25);
    letter-spacing: 0.5px;
    font-weight: 500;
  }

  /* Left footer */
  .ol-left-footer {
    font-size: 11.5px;
    color: rgba(255,255,255,0.18);
    letter-spacing: 0.3px;
  }

  /* ── Right panel (form) ── */
  .ol-right {
    position: relative;
    z-index: 2;
    background: #f7f7fb;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 52px 48px;
    border-left: 1px solid rgba(255,255,255,0.04);
  }
  .ol-right::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    opacity: 0.45;
  }

  /* Step indicator */
  .ol-step-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 32px;
    opacity: 0;
    animation: fadeUp 0.5s ease forwards 100ms;
  }
  .ol-step {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.3px;
  }
  .ol-step-num {
    width: 24px; height: 24px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .ol-step.active .ol-step-num {
    background: var(--ink);
    color: #fff;
  }
  .ol-step.active .ol-step-label { color: var(--ink); }
  .ol-step.inactive .ol-step-num {
    background: rgba(10,10,15,0.08);
    color: var(--ink-faint);
  }
  .ol-step.inactive .ol-step-label { color: var(--ink-faint); }
  .ol-step-label { font-size: 11.5px; }
  .ol-step-connector {
    flex: 1;
    height: 1px;
    background: var(--border-md);
  }

  /* Progress bar */
  .ol-progress {
    height: 2px;
    background: rgba(10,10,15,0.06);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 36px;
    opacity: 0;
    animation: fadeUp 0.5s ease forwards 150ms;
  }
  .ol-progress-fill {
    height: 100%;
    width: 50%;
    background: linear-gradient(90deg, var(--gold), #a87c40);
    border-radius: 2px;
    transition: width 0.4s ease;
  }

  /* Form title */
  .ol-form-title {
    font-family: var(--font-serif);
    font-size: 1.7rem;
    color: var(--ink);
    letter-spacing: -0.4px;
    line-height: 1.15;
    margin-bottom: 8px;
    opacity: 0;
    animation: fadeUp 0.5s ease forwards 200ms;
  }
  .ol-form-title em { color: var(--gold); font-style: italic; }
  .ol-form-sub {
    font-size: 13.5px;
    color: var(--ink-faint);
    line-height: 1.6;
    margin-bottom: 28px;
    opacity: 0;
    animation: fadeUp 0.5s ease forwards 260ms;
  }

  /* Fields */
  .ol-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 18px;
    opacity: 0;
    animation: fadeUp 0.5s ease forwards 320ms;
  }
  .ol-label {
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: var(--ink-muted);
  }
  .ol-input-wrap { position: relative; }
  .ol-input-icon {
    position: absolute;
    left: 14px; top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--ink-faint);
    display: flex;
  }
  .ol-input {
    width: 100%;
    height: 48px;
    padding: 0 16px 0 44px;
    border: 1.5px solid var(--border-md);
    border-radius: var(--radius-sm);
    font-family: var(--font-sans);
    font-size: 14.5px;
    font-weight: 500;
    color: var(--ink);
    background: #fff;
    outline: none;
    letter-spacing: 0.5px;
    transition: border-color var(--transition), box-shadow var(--transition);
    -webkit-appearance: none;
  }
  .ol-input:focus {
    border-color: var(--gold);
    box-shadow: 0 0 0 3px rgba(200,169,110,0.14);
  }
  .ol-input::placeholder { color: var(--ink-faint); font-weight: 400; letter-spacing: 0; }
  .ol-input.err { border-color: var(--red); }
  .ol-input.err:focus { box-shadow: 0 0 0 3px rgba(192,57,43,0.12); }

  /* Error */
  .ol-error {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: rgba(192,57,43,0.06);
    border: 1px solid rgba(192,57,43,0.15);
    border-radius: var(--radius-sm);
    font-size: 13px;
    color: var(--red);
    margin-bottom: 16px;
    line-height: 1.4;
  }

  /* Buttons */
  .ol-btn-primary {
    width: 100%;
    height: 50px;
    border: none;
    border-radius: var(--radius-sm);
    background: linear-gradient(135deg, var(--gold) 0%, #a87c40 100%);
    color: #fff;
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.3px;
    cursor: pointer;
    transition: all var(--transition);
    box-shadow: 0 2px 18px rgba(200,169,110,0.35);
    display: flex; align-items: center; justify-content: center; gap: 9px;
    margin-bottom: 10px;
    opacity: 0;
    animation: fadeUp 0.5s ease forwards 380ms;
  }
  .ol-btn-primary:hover:not(:disabled) {
    box-shadow: 0 4px 28px rgba(200,169,110,0.5);
    transform: translateY(-1px);
  }
  .ol-btn-primary:active:not(:disabled) { transform: translateY(0); }
  .ol-btn-primary:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .ol-btn-ghost {
    width: 100%;
    height: 42px;
    background: transparent;
    border: 1.5px solid var(--border-md);
    border-radius: var(--radius-sm);
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 500;
    color: var(--ink-muted);
    cursor: pointer;
    transition: all var(--transition);
    display: flex; align-items: center; justify-content: center; gap: 7px;
    opacity: 0;
    animation: fadeUp 0.5s ease forwards 440ms;
    text-decoration: none;
  }
  .ol-btn-ghost:hover {
    background: rgba(10,10,15,0.04);
    color: var(--ink);
    border-color: var(--border-md);
  }

  /* Spinner */
  .ol-spinner {
    width: 15px; height: 15px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  /* Security footer */
  .ol-security {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--ink-faint);
    letter-spacing: 0.2px;
    opacity: 0;
    animation: fadeUp 0.5s ease forwards 500ms;
  }
  .ol-security-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--teal);
    flex-shrink: 0;
    box-shadow: 0 0 6px var(--teal);
    animation: pulse 2.2s ease infinite;
  }

  /* Animations */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  /* Responsive */
  @media (max-width: 800px) {
    .ol-shell { grid-template-columns: 1fr; }
    .ol-left  { display: none; }
    .ol-right { min-height: 100vh; padding: 40px 28px; }
  }
`;

/* ── Fluid animated background ── */
function FluidBg() {
  const ref = useRef(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const frameRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");

    const onMove = (e) => {
      mouse.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    };
    window.addEventListener("mousemove", onMove);

    const draw = () => {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
      const W = c.width, H = c.height;
      ctx.fillStyle = "#0a0a0f";
      ctx.fillRect(0, 0, W, H);

      const t = timeRef.current;
      const orbs = [
        { x: 0.15 + Math.sin(t * 0.33) * 0.1 + mouse.current.x * 0.04, y: 0.2 + Math.cos(t * 0.25) * 0.08, r: 0.5,  c: "rgba(200,169,110,0.06)" },
        { x: 0.65 + Math.cos(t * 0.28) * 0.08 - mouse.current.x * 0.03, y: 0.6 + Math.sin(t * 0.38) * 0.1, r: 0.38, c: "rgba(26,127,116,0.055)" },
        { x: 0.45 + Math.sin(t * 0.2) * 0.12, y: 0.85 + Math.cos(t * 0.3) * 0.05, r: 0.3, c: "rgba(200,169,110,0.04)" },
        { x: mouse.current.x * 0.8 + 0.1, y: mouse.current.y * 0.8 + 0.1, r: 0.22, c: "rgba(200,169,110,0.032)" },
      ];

      orbs.forEach((o) => {
        const gx = o.x * W, gy = o.y * H, gr = o.r * Math.max(W, H);
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
        g.addColorStop(0, o.c);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });

      timeRef.current += 0.006;
      frameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(frameRef.current); };
  }, []);

  return <canvas ref={ref} className="ol-canvas" aria-hidden="true" />;
}

/* ── Icons ── */
const BuildingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const HashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
    <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const BackIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

/* ── Main Component ── */
export default function OrganisationLogin() {
  const [organisationId, setOrganisationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiFetch("/auth/validate-organisation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organisation_id: organisationId.trim() }),
      });
      const data = await readResponseData(res);
      if (!res.ok) throw new Error(data?.detail || "Validation failed");
      localStorage.setItem(ORG_CONTEXT_KEY, JSON.stringify(data?.tenant || null));
      window.location.href = "/login/credentials";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const features = [
    { text: "Role-based access across all tiers", delay: 500 },
    { text: "Real-time student and staff management", delay: 600 },
    { text: "Bulk import and credential provisioning", delay: 700 },
    { text: "Multi-tenant architecture at scale", delay: 800 },
  ];

  const stats = [
    { value: "1,047+", label: "Schools" },
    { value: "127K", label: "Students" },
    { value: "99.9%", label: "Uptime" },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="ol-shell">
        <FluidBg />

        {/* watermark logo */}
        <img
          src={logo}
          alt=""
          aria-hidden="true"
          style={{
            position: "fixed", inset: 0,
            width: "100vw", height: "100vh",
            objectFit: "cover",
            opacity: 0.022,
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 1,
          }}
        />

        {/* ── Left decorative panel ── */}
        <div className="ol-left">
          {/* Logo */}
          <div className="ol-logo">
            <div className="ol-logo-mark"><BuildingIcon /></div>
            <span className="ol-logo-name">Organisation</span>
          </div>

          {/* Hero */}
          <div className="ol-hero">
            <div className="ol-eyebrow">
              <span className="ol-eyebrow-line" />
              <span className="ol-eyebrow-text">Secure Portal</span>
            </div>
            <h1 className="ol-title">
              Your school,<br /><em>unified</em><br />and in control.
            </h1>
            <p className="ol-sub">
              Enter your organisation code to access your institution's workspace — classrooms, staff, and students, all from one command centre.
            </p>

            <div className="ol-features">
              {features.map(({ text, delay }) => (
                <div className="ol-feature" key={text} style={{ animationDelay: `${delay}ms` }}>
                  <span className="ol-feature-dot" />
                  {text}
                </div>
              ))}
            </div>

            <div className="ol-stats">
              {stats.map(({ value, label }) => (
                <div key={label}>
                  <div className="ol-stat-val">{value}</div>
                  <div className="ol-stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="ol-left-footer">
            © {new Date().getFullYear()} Organisation Platform
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="ol-right">
          {/* Step indicator */}
          <div className="ol-step-row">
            <div className="ol-step active">
              <div className="ol-step-num">1</div>
              <span className="ol-step-label">Organisation</span>
            </div>
            <div className="ol-step-connector" />
            <div className="ol-step inactive">
              <div className="ol-step-num">2</div>
              <span className="ol-step-label">Credentials</span>
            </div>
          </div>

          {/* Progress */}
          <div className="ol-progress">
            <div className="ol-progress-fill" />
          </div>

          {/* Form header */}
          <h2 className="ol-form-title">
            Enter your <em>organisation</em>
          </h2>
          <p className="ol-form-sub">
            Use the unique code provided by your system administrator to identify your school's workspace.
          </p>

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="ol-field">
              <label className="ol-label">Organisation ID</label>
              <div className="ol-input-wrap">
                <span className="ol-input-icon" style={{ color: focused ? "var(--gold)" : "var(--ink-faint)", transition: "color 0.2s" }}>
                  <HashIcon />
                </span>
                <input
                  type="text"
                  className={`ol-input ${error ? "err" : ""}`}
                  placeholder="e.g. ORG-2024-ALPHA"
                  value={organisationId}
                  onChange={e => setOrganisationId(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  required
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="ol-error">
                <AlertIcon /> {error}
              </div>
            )}

            <button
              type="submit"
              className="ol-btn-primary"
              disabled={loading || !organisationId.trim()}
            >
              {loading
                ? <><span className="ol-spinner" /> Verifying…</>
                : <>Continue <ArrowIcon /></>
              }
            </button>

            <button
              type="button"
              className="ol-btn-ghost"
              onClick={() => { window.history.pushState({}, "", "/"); window.dispatchEvent(new PopStateEvent("popstate")); }}
            >
              <BackIcon /> Back to home
            </button>
          </form>

          <div className="ol-security">
            <span className="ol-security-dot" />
            <ShieldIcon />
            256-bit encrypted · ISO 27001 · SOC 2 Type II
          </div>
        </div>
      </div>
    </>
  );
}
