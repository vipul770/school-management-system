import React, { useEffect, useMemo, useState } from "react";
import { apiFetch, readResponseData } from "../../services/api";
import { getDashboardPath } from "../../utils/dashboardPath";

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
    --red:       #c0392b;
    --surface-2: #ffffff;
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

  /* ── Full-screen shell ── */
  .lg-shell {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 480px;
    background: var(--ink);
    overflow: hidden;
    position: relative;
  }

  /* ── Left decorative panel ── */
  .lg-left {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 52px 60px;
    overflow: hidden;
  }

  /* Noise grain overlay */
  .lg-left::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 1;
  }

  /* Diagonal grid lines */
  .lg-left::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      repeating-linear-gradient(
        -55deg,
        transparent,
        transparent 60px,
        rgba(255,255,255,0.022) 60px,
        rgba(255,255,255,0.022) 61px
      );
    pointer-events: none;
    z-index: 1;
  }

  /* Ambient glow blobs */
  .lg-glow-1 {
    position: absolute;
    width: 560px; height: 560px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(200,169,110,0.14) 0%, transparent 65%);
    top: -100px; left: -140px;
    pointer-events: none;
  }
  .lg-glow-2 {
    position: absolute;
    width: 420px; height: 420px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(26,127,116,0.12) 0%, transparent 65%);
    bottom: -60px; right: -80px;
    pointer-events: none;
  }
  .lg-glow-3 {
    position: absolute;
    width: 240px; height: 240px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(200,169,110,0.08) 0%, transparent 70%);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  /* ── Left content ── */
  .lg-left-content { position: relative; z-index: 2; }

  .lg-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #fff;
    text-decoration: none;
  }
  .lg-brand-mark {
    width: 36px; height: 36px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--gold) 0%, #a87c40 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 16px rgba(200,169,110,0.4);
  }
  .lg-brand-mark svg { width: 18px; height: 18px; }
  .lg-brand-name {
    font-family: var(--font-serif);
    font-size: 18px;
    color: #fff;
    letter-spacing: -0.2px;
  }

  .lg-hero {
    margin-top: auto;
    padding-bottom: 8px;
  }
  .lg-hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 20px;
  }
  .lg-hero-eyebrow-line {
    width: 24px; height: 1px;
    background: var(--gold);
    opacity: 0.6;
  }
  .lg-hero-title {
    font-family: var(--font-serif);
    font-size: clamp(2.4rem, 4vw, 3.4rem);
    color: #fff;
    line-height: 1.08;
    letter-spacing: -1px;
    margin-bottom: 20px;
  }
  .lg-hero-title em {
    color: var(--gold);
    font-style: italic;
  }
  .lg-hero-sub {
    font-size: 14px;
    color: rgba(255,255,255,0.42);
    line-height: 1.65;
    max-width: 380px;
    font-weight: 400;
  }

  .lg-features {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 40px;
  }
  .lg-feature {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: rgba(255,255,255,0.45);
  }
  .lg-feature-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--gold);
    opacity: 0.6;
    flex-shrink: 0;
  }

  .lg-left-footer {
    position: relative;
    z-index: 2;
    font-size: 12px;
    color: rgba(255,255,255,0.2);
    letter-spacing: 0.3px;
  }

  /* ── Right panel (form) ── */
  .lg-right {
    background: #f7f7fb;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 52px 52px;
    position: relative;
    border-left: 1px solid rgba(255,255,255,0.04);
  }

  /* subtle top gradient line */
  .lg-right::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    opacity: 0.5;
  }

  .lg-home-btn {
    position: absolute;
    top: 24px; right: 24px;
    display: flex; align-items: center; gap: 6px;
    padding: 7px 14px;
    border-radius: var(--radius-sm);
    background: rgba(10,10,15,0.06);
    border: 1.5px solid var(--border-md);
    font-family: var(--font-sans);
    font-size: 12.5px;
    font-weight: 500;
    color: var(--ink-muted);
    cursor: pointer;
    text-decoration: none;
    transition: all var(--transition);
  }
  .lg-home-btn:hover {
    background: rgba(10,10,15,0.09);
    color: var(--ink);
  }

  .lg-form-header {
    margin-bottom: 32px;
  }
  .lg-form-title {
    font-family: var(--font-serif);
    font-size: 1.85rem;
    color: var(--ink);
    letter-spacing: -0.4px;
    line-height: 1.15;
    margin-bottom: 8px;
  }
  .lg-form-title em { color: var(--gold); font-style: italic; }
  .lg-form-sub {
    font-size: 13.5px;
    color: var(--ink-faint);
    line-height: 1.55;
  }

  /* ── Fields ── */
  .lg-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }
  .lg-label {
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: var(--ink-muted);
  }
  .lg-input {
    width: 100%;
    height: 46px;
    padding: 0 16px;
    border: 1.5px solid var(--border-md);
    border-radius: var(--radius-sm);
    font-family: var(--font-sans);
    font-size: 14px;
    color: var(--ink);
    background: #fff;
    outline: none;
    transition: border-color var(--transition), box-shadow var(--transition);
    -webkit-appearance: none;
  }
  .lg-input:focus {
    border-color: var(--gold);
    box-shadow: 0 0 0 3px rgba(200,169,110,0.14);
  }
  .lg-input::placeholder { color: var(--ink-faint); }
  .lg-input.err { border-color: var(--red); }
  .lg-input.err:focus { box-shadow: 0 0 0 3px rgba(192,57,43,0.12); }

  /* ── Password toggle ── */
  .lg-pwd-wrap {
    position: relative;
  }
  .lg-pwd-wrap .lg-input { padding-right: 44px; }
  .lg-pwd-toggle {
    position: absolute;
    right: 14px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    cursor: pointer;
    color: var(--ink-faint);
    padding: 4px;
    display: flex; align-items: center;
    transition: color var(--transition);
  }
  .lg-pwd-toggle:hover { color: var(--ink-muted); }

  /* ── Buttons ── */
  .lg-btn-primary {
    width: 100%;
    height: 48px;
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
    box-shadow: 0 2px 16px rgba(200,169,110,0.35);
    margin-top: 8px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .lg-btn-primary:hover {
    box-shadow: 0 4px 24px rgba(200,169,110,0.5);
    transform: translateY(-1px);
  }
  .lg-btn-primary:active { transform: translateY(0); }
  .lg-btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .lg-btn-ghost {
    background: none;
    border: none;
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 500;
    color: var(--ink-muted);
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-color: transparent;
    transition: all var(--transition);
  }
  .lg-btn-ghost:hover {
    color: var(--ink);
    text-decoration-color: var(--ink-faint);
  }

  /* ── Error ── */
  .lg-error {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: rgba(192,57,43,0.06);
    border: 1px solid rgba(192,57,43,0.15);
    border-radius: var(--radius-sm);
    font-size: 13px;
    color: var(--red);
    margin-top: 4px;
    margin-bottom: 8px;
    line-height: 1.4;
  }

  /* ── Divider ── */
  .lg-divider {
    height: 1px;
    background: var(--border);
    margin: 24px 0;
  }

  /* ── Footer links ── */
  .lg-form-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
    flex-wrap: wrap;
    gap: 10px;
  }
  .lg-form-footer-link {
    font-size: 12.5px;
    color: var(--ink-faint);
    text-decoration: none;
    cursor: pointer;
    transition: color var(--transition);
  }
  .lg-form-footer-link:hover { color: var(--ink-muted); }

  /* ── Change password modal ── */
  .lg-overlay {
    position: fixed;
    inset: 0;
    background: rgba(10,10,15,0.55);
    backdrop-filter: blur(6px);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.2s ease;
  }
  .lg-modal {
    background: #fff;
    border-radius: var(--radius);
    width: 100%;
    max-width: 420px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08);
    overflow: hidden;
    animation: slideUp 0.25s cubic-bezier(0.4,0,0.2,1);
  }
  .lg-modal-head {
    padding: 28px 32px 0;
    border-bottom: 1px solid var(--border);
    padding-bottom: 20px;
  }
  .lg-modal-title {
    font-family: var(--font-serif);
    font-size: 1.3rem;
    color: var(--ink);
    letter-spacing: -0.3px;
    margin-bottom: 6px;
  }
  .lg-modal-sub {
    font-size: 13px;
    color: var(--ink-faint);
    line-height: 1.5;
  }
  .lg-modal-body { padding: 24px 32px; }
  .lg-modal-foot {
    padding: 0 32px 28px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* ── Spinner ── */
  .lg-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Responsive ── */
  @media (max-width: 780px) {
    .lg-shell { grid-template-columns: 1fr; }
    .lg-left { display: none; }
    .lg-right { padding: 40px 28px; min-height: 100vh; }
  }
`;

/* ── SVG Icons ── */
const EyeIcon = ({ open }) => open
  ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>;

const HomeIconSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

/* ── Field component ── */
function Field({ label, children }) {
  return (
    <div className="lg-field">
      <label className="lg-label">{label}</label>
      {children}
    </div>
  );
}

/* ── Password field ── */
function PwdField({ label, value, onChange, placeholder, hasError }) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label}>
      <div className="lg-pwd-wrap">
        <input
          type={show ? "text" : "password"}
          className={`lg-input ${hasError ? "err" : ""}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder || "••••••••"}
          autoComplete="current-password"
        />
        <button type="button" className="lg-pwd-toggle" onClick={() => setShow(s => !s)} tabIndex={-1}>
          <EyeIcon open={show} />
        </button>
      </div>
    </Field>
  );
}

/* ── Main Component ── */
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [pendingProfile, setPendingProfile] = useState(null);

  const orgContext = useMemo(() => {
    try { return JSON.parse(localStorage.getItem(ORG_CONTEXT_KEY) || "null"); }
    catch { return null; }
  }, []);

  useEffect(() => {
    const savedProfile = typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("profile") || "null") : null;
    const savedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (savedToken && savedProfile?.must_change_password) {
      setPendingProfile(savedProfile);
      setChangePasswordOpen(true);
    }
  }, []);

  const goHome = () => {
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);
      const res = await apiFetch("/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      const data = await readResponseData(res);
      if (!res.ok) { setError("Invalid credentials. Please try again."); return; }
      localStorage.setItem("token", data.access_token);
      const me = await apiFetch("/auth/me", { headers: { Authorization: `Bearer ${data.access_token}` } });
      const profile = await readResponseData(me);
      localStorage.setItem("profile", JSON.stringify(profile));
      if (profile?.must_change_password) {
        setPendingProfile(profile);
        setChangePasswordOpen(true);
        return;
      }
      window.history.pushState({}, "", getDashboardPath(profile));
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword() {
    setError(null);
    if (!newPassword || newPassword.length < 6) { setError("New password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    const token = localStorage.getItem("token");
    if (!token) { setError("Session expired. Please sign in again."); return; }
    setChangePasswordLoading(true);
    try {
      const res = await apiFetch("/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ new_password: newPassword }),
      });
      const data = await readResponseData(res);
      if (!res.ok) { setError(data?.detail || "Could not change password"); return; }
      const me = await apiFetch("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      const profile = await readResponseData(me);
      localStorage.setItem("profile", JSON.stringify(profile));
      setPendingProfile(profile);
      setChangePasswordOpen(false);
      setNewPassword(""); setConfirmPassword("");
      window.history.pushState({}, "", getDashboardPath(profile));
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch (err) {
      setError(err.message);
    } finally {
      setChangePasswordLoading(false);
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="lg-shell">

        {/* ── Left Decorative Panel ── */}
        <div className="lg-left">
          <div className="lg-glow-1" /><div className="lg-glow-2" /><div className="lg-glow-3" />

          <div className="lg-left-content">
            <div className="lg-brand">
              <div className="lg-brand-mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <span className="lg-brand-name">Organisation</span>
            </div>
          </div>

          <div className="lg-hero">
            <div className="lg-hero-eyebrow">
              <span className="lg-hero-eyebrow-line" />
              Admin Access
            </div>
            <h1 className="lg-hero-title">
              Manage your<br/><em>organisation</em><br/>with precision.
            </h1>
            <p className="lg-hero-sub">
              A unified dashboard for classrooms, students, teachers, and operations — everything your institution needs.
            </p>
            <div className="lg-features">
              {["Role-based access control", "Classroom & student management", "Bulk import via Excel", "Real-time credential provisioning"].map(f => (
                <div className="lg-feature" key={f}>
                  <span className="lg-feature-dot" />{f}
                </div>
              ))}
            </div>
          </div>

          <div className="lg-left-footer">
            © {new Date().getFullYear()} Organisation Platform
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="lg-right">
          <button className="lg-home-btn" onClick={goHome}>
            <HomeIconSvg /> Home
          </button>

          <div className="lg-form-header">
            <h2 className="lg-form-title">
              {forgotMode ? "Reset your" : "Welcome"} <em>{forgotMode ? "password" : "back"}</em>
            </h2>
            <p className="lg-form-sub">
              {forgotMode
                ? "Enter your username and set a new password."
                : "Sign in to access your organisation dashboard."}
            </p>
          </div>

          <form onSubmit={handleLogin} autoComplete="on">
            {!orgContext?.id && !forgotMode && (
              <Field label="Organisation ID">
                <input
                  className="lg-input"
                  placeholder="e.g. ORG-1024"
                  value={organizationId}
                  onChange={e => setOrganizationId(e.target.value)}
                  autoComplete="organization"
                />
              </Field>
            )}

            <Field label="Username">
              <input
                className="lg-input"
                placeholder="your_username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </Field>

            {!forgotMode ? (
              <PwdField
                label="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            ) : (
              <>
                <PwdField label="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 characters" />
                <PwdField label="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" />
              </>
            )}

            {error && (
              <div className="lg-error">
                <AlertIcon /> {error}
              </div>
            )}

            <button type="submit" className="lg-btn-primary" disabled={loading}>
              {loading
                ? <><span className="lg-spinner" /> {forgotMode ? "Updating…" : "Signing in…"}</>
                : forgotMode ? "Update password" : "Sign in"
              }
            </button>
          </form>

          <div className="lg-divider" />

          <div className="lg-form-footer">
            <button
              className="lg-btn-ghost"
              onClick={() => { setForgotMode(v => !v); setError(null); setNewPassword(""); setConfirmPassword(""); }}
            >
              {forgotMode ? "← Back to sign in" : "Forgot password?"}
            </button>
            <button className="lg-btn-ghost" onClick={goHome}>Back to home</button>
          </div>
        </div>
      </div>

      {/* ── Change Password Modal ── */}
      {changePasswordOpen && (
        <div className="lg-overlay">
          <div className="lg-modal">
            <div className="lg-modal-head">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #c8a96e, #a87c40)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <LockIcon />
                </div>
                <h3 className="lg-modal-title" style={{ margin: 0 }}>Change Password</h3>
              </div>
              <p className="lg-modal-sub">
                <strong>{pendingProfile?.full_name || pendingProfile?.username || "This account"}</strong> must set a new password before continuing.
              </p>
            </div>
            <div className="lg-modal-body">
              <PwdField label="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 characters" />
              <PwdField label="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" />
              {error && (
                <div className="lg-error">
                  <AlertIcon /> {error}
                </div>
              )}
            </div>
            <div className="lg-modal-foot">
              <button className="lg-btn-primary" style={{ marginTop: 0 }} onClick={handleChangePassword} disabled={changePasswordLoading}>
                {changePasswordLoading
                  ? <><span className="lg-spinner" /> Updating…</>
                  : "Set new password & continue"
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}