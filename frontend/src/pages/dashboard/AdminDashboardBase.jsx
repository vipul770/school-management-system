import React, { useEffect, useMemo, useState } from "react";
import { apiFetch, getApiBaseUrl } from "../../services/api";

/* ─────────────────────────── Design Tokens ─────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  :root {
    --ink:       #0a0a0f;
    --ink-muted: #4a4a5a;
    --ink-faint: #9090a8;
    --surface:   #f7f7fb;
    --surface-2: #ffffff;
    --surface-3: #eeeef6;
    --border:    rgba(10,10,15,0.08);
    --border-md: rgba(10,10,15,0.14);
    --gold:      #c8a96e;
    --gold-dim:  #e8d5b0;
    --gold-bg:   #fdf9f2;
    --teal:      #1a7f74;
    --teal-lt:   #e8f5f3;
    --red:       #c0392b;
    --red-lt:    #fdf1f0;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
    --shadow-lg: 0 12px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06);
    --radius:    14px;
    --radius-sm: 8px;
    --font-serif: 'Instrument Serif', Georgia, serif;
    --font-sans:  'DM Sans', system-ui, sans-serif;
    --transition: 200ms cubic-bezier(0.4,0,0.2,1);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: var(--font-sans);
    background: var(--surface);
    color: var(--ink);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  /* Shell */
  .adm-shell {
    display: grid;
    grid-template-columns: 260px 1fr;
    min-height: 100vh;
    background: var(--surface);
  }

  /* ── Sidebar ── */
  .adm-sidebar {
    background: var(--ink);
    color: #fff;
    display: flex;
    flex-direction: column;
    padding: 32px 0 24px;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
  }
  .adm-sidebar::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 40px,
      rgba(255,255,255,0.015) 40px,
      rgba(255,255,255,0.015) 41px
    );
    pointer-events: none;
  }
  .adm-logo {
    padding: 0 24px 32px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .adm-logo-mark {
    font-family: var(--font-serif);
    font-size: 22px;
    color: #fff;
    letter-spacing: -0.3px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .adm-logo-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--gold);
    flex-shrink: 0;
    box-shadow: 0 0 12px var(--gold);
  }
  .adm-logo-sub {
    font-size: 11px;
    color: rgba(255,255,255,0.35);
    font-weight: 500;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    margin-top: 4px;
    padding-left: 18px;
  }

  .adm-nav {
    flex: 1;
    padding: 20px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .adm-nav-section {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.25);
    padding: 14px 12px 6px;
  }
  .adm-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: var(--radius-sm);
    font-size: 13.5px;
    font-weight: 450;
    color: rgba(255,255,255,0.6);
    cursor: pointer;
    transition: all var(--transition);
    text-decoration: none;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
  }
  .adm-nav-item:hover {
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.9);
  }
  .adm-nav-item.active {
    background: rgba(200,169,110,0.15);
    color: var(--gold-dim);
    font-weight: 500;
  }
  .adm-nav-icon {
    width: 18px;
    height: 18px;
    opacity: 0.7;
    flex-shrink: 0;
  }
  .adm-nav-item.active .adm-nav-icon { opacity: 1; }

  .adm-sidebar-footer {
    padding: 16px 12px;
    border-top: 1px solid rgba(255,255,255,0.08);
    margin: 0 12px;
  }
  .adm-user-chip {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: rgba(255,255,255,0.05);
    border-radius: var(--radius-sm);
  }
  .adm-user-avatar {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--gold) 0%, #a87c40 100%);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 600; color: #fff;
    flex-shrink: 0;
  }
  .adm-user-name {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.85);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .adm-user-role {
    font-size: 10.5px;
    color: rgba(255,255,255,0.35);
    font-weight: 400;
    letter-spacing: 0.3px;
  }

  /* ── Main ── */
  .adm-main {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    overflow: hidden;
  }

  .adm-topbar {
    background: var(--surface-2);
    border-bottom: 1px solid var(--border);
    padding: 0 36px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 50;
    backdrop-filter: blur(12px);
  }
  .adm-breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--ink-faint);
  }
  .adm-breadcrumb span { color: var(--ink); font-weight: 500; }
  .adm-topbar-actions { display: flex; gap: 10px; align-items: center; }

  /* ── Content ── */
  .adm-content {
    flex: 1;
    padding: 36px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  /* ── Page Header ── */
  .adm-page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
  }
  .adm-page-title {
    font-family: var(--font-serif);
    font-size: clamp(1.6rem, 3vw, 2.4rem);
    font-weight: 400;
    color: var(--ink);
    letter-spacing: -0.5px;
    line-height: 1.1;
  }
  .adm-page-title em {
    color: var(--gold);
    font-style: italic;
  }
  .adm-page-sub {
    font-size: 13.5px;
    color: var(--ink-muted);
    margin-top: 6px;
    font-weight: 400;
    max-width: 520px;
    line-height: 1.55;
  }

  /* ── Org Banner ── */
  .adm-org-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 18px;
    background: var(--gold-bg);
    border: 1px solid var(--gold-dim);
    border-radius: var(--radius-sm);
    font-size: 13px;
    color: #7a5c2e;
    font-weight: 500;
  }
  .adm-org-banner-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--gold);
  }

  /* ── Stat Cards ── */
  .adm-stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 14px;
  }
  .adm-stat {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px 18px;
    box-shadow: var(--shadow-sm);
    transition: box-shadow var(--transition), transform var(--transition);
    position: relative;
    overflow: hidden;
  }
  .adm-stat::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--gold) 0%, transparent 100%);
    opacity: 0;
    transition: opacity var(--transition);
  }
  .adm-stat:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
  .adm-stat:hover::after { opacity: 1; }
  .adm-stat-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.7px;
    text-transform: uppercase;
    color: var(--ink-faint);
    margin-bottom: 10px;
  }
  .adm-stat-value {
    font-family: var(--font-serif);
    font-size: 2.2rem;
    color: var(--ink);
    line-height: 1;
    letter-spacing: -1px;
  }
  .adm-stat-sub {
    font-size: 11.5px;
    color: var(--ink-faint);
    margin-top: 6px;
  }

  /* ── Panels ── */
  .adm-panel {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }
  .adm-panel-head {
    padding: 22px 28px 0;
  }
  .adm-panel-title {
    font-family: var(--font-serif);
    font-size: 1.15rem;
    font-weight: 400;
    color: var(--ink);
    letter-spacing: -0.2px;
  }
  .adm-panel-sub {
    font-size: 12.5px;
    color: var(--ink-faint);
    margin-top: 4px;
    line-height: 1.5;
  }
  .adm-panel-divider {
    height: 1px;
    background: var(--border);
    margin: 18px 0 0;
  }
  .adm-panel-body { padding: 22px 28px; }

  /* ── Grid ── */
  .adm-grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .adm-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  /* ── Form Fields ── */
  .adm-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .adm-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--ink-muted);
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }
  .adm-input {
    width: 100%;
    height: 42px;
    padding: 0 14px;
    border: 1.5px solid var(--border-md);
    border-radius: var(--radius-sm);
    font-family: var(--font-sans);
    font-size: 14px;
    color: var(--ink);
    background: var(--surface);
    transition: border-color var(--transition), box-shadow var(--transition), background var(--transition);
    outline: none;
    -webkit-appearance: none;
  }
  .adm-input:focus {
    border-color: var(--gold);
    box-shadow: 0 0 0 3px rgba(200,169,110,0.15);
    background: var(--surface-2);
  }
  .adm-input::placeholder { color: var(--ink-faint); }
  .adm-input[readonly] { color: var(--ink-faint); cursor: default; }
  .adm-input.error { border-color: var(--red); }
  .adm-input.error:focus { box-shadow: 0 0 0 3px rgba(192,57,43,0.12); }
  .adm-select { appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239090a8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }
  .adm-hint {
    font-size: 11.5px;
    color: var(--ink-faint);
    margin-top: 2px;
  }
  .adm-hint.error { color: var(--red); }

  /* ── Buttons ── */
  .adm-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    height: 40px;
    padding: 0 20px;
    border-radius: var(--radius-sm);
    font-family: var(--font-sans);
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all var(--transition);
    white-space: nowrap;
    text-decoration: none;
  }
  .adm-btn-primary {
    background: var(--ink);
    color: #fff;
    box-shadow: var(--shadow-sm);
  }
  .adm-btn-primary:hover { background: #1e1e2e; box-shadow: var(--shadow-md); transform: translateY(-1px); }
  .adm-btn-primary:active { transform: translateY(0); }
  .adm-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

  .adm-btn-ghost {
    background: transparent;
    color: var(--ink-muted);
    border: 1.5px solid var(--border-md);
  }
  .adm-btn-ghost:hover { background: var(--surface-3); color: var(--ink); border-color: var(--border-md); }
  
  .adm-btn-gold {
    background: linear-gradient(135deg, var(--gold) 0%, #a87c40 100%);
    color: #fff;
    box-shadow: 0 2px 12px rgba(200,169,110,0.35);
  }
  .adm-btn-gold:hover { box-shadow: 0 4px 20px rgba(200,169,110,0.5); transform: translateY(-1px); }
  .adm-btn-gold:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

  .adm-btn-danger {
    background: var(--red-lt);
    color: var(--red);
    border: 1.5px solid rgba(192,57,43,0.2);
  }
  .adm-btn-danger:hover { background: var(--red); color: #fff; }

  .adm-btn-sm { height: 34px; padding: 0 14px; font-size: 12.5px; }

  /* ── Tag / Badge ── */
  .adm-badge {
    display: inline-flex;
    align-items: center;
    height: 22px;
    padding: 0 9px;
    border-radius: 99px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }
  .adm-badge-teal { background: var(--teal-lt); color: var(--teal); }
  .adm-badge-gold { background: var(--gold-bg); color: #9a6e2a; border: 1px solid var(--gold-dim); }

  /* ── List items ── */
  .adm-list {
    display: flex;
    flex-direction: column;
    margin-top: 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    overflow: hidden;
    max-height: 240px;
    overflow-y: auto;
  }
  .adm-list::-webkit-scrollbar { width: 4px; }
  .adm-list::-webkit-scrollbar-track { background: transparent; }
  .adm-list::-webkit-scrollbar-thumb { background: var(--border-md); border-radius: 2px; }
  .adm-list-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    font-size: 13px;
    color: var(--ink-muted);
    border-bottom: 1px solid var(--border);
    transition: background var(--transition);
  }
  .adm-list-item:last-child { border-bottom: none; }
  .adm-list-item:hover { background: var(--surface-3); }
  .adm-list-item-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--gold-dim);
    flex-shrink: 0;
  }
  .adm-list-empty {
    padding: 20px 14px;
    font-size: 13px;
    color: var(--ink-faint);
    text-align: center;
    font-style: italic;
  }

  /* ── Section divider ── */
  .adm-section-label {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--ink-faint);
    margin-bottom: 14px;
  }
  .adm-section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  /* ── Import area ── */
  .adm-upload-zone {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px;
    background: var(--surface);
    border: 1.5px dashed var(--border-md);
    border-radius: var(--radius-sm);
    transition: border-color var(--transition), background var(--transition);
    cursor: pointer;
    flex-wrap: wrap;
  }
  .adm-upload-zone:hover { border-color: var(--gold); background: var(--gold-bg); }
  .adm-upload-zone input[type=file] {
    font-size: 13px;
    font-family: var(--font-sans);
    color: var(--ink-muted);
    flex: 1;
    min-width: 0;
    cursor: pointer;
    outline: none;
  }
  .adm-upload-zone input[type=file]::file-selector-button {
    background: var(--surface-2);
    border: 1.5px solid var(--border-md);
    padding: 6px 14px;
    border-radius: var(--radius-sm);
    font-family: var(--font-sans);
    font-size: 12.5px;
    font-weight: 500;
    color: var(--ink-muted);
    cursor: pointer;
    margin-right: 10px;
    transition: all var(--transition);
  }

  /* ── Import stats ── */
  .adm-import-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 10px;
    margin-top: 16px;
  }
  .adm-import-stat {
    background: var(--teal-lt);
    border: 1px solid rgba(26,127,116,0.15);
    border-radius: var(--radius-sm);
    padding: 12px 14px;
    text-align: center;
  }
  .adm-import-stat-value {
    font-family: var(--font-serif);
    font-size: 1.6rem;
    color: var(--teal);
  }
  .adm-import-stat-label {
    font-size: 11px;
    color: var(--teal);
    font-weight: 500;
    letter-spacing: 0.3px;
    margin-top: 2px;
    opacity: 0.8;
  }
  .adm-import-stat.err {
    background: var(--red-lt);
    border-color: rgba(192,57,43,0.15);
  }
  .adm-import-stat.err .adm-import-stat-value,
  .adm-import-stat.err .adm-import-stat-label { color: var(--red); }

  /* ── Alert ── */
  .adm-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 16px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    line-height: 1.5;
    margin-top: 12px;
  }
  .adm-alert-success { background: var(--teal-lt); color: var(--teal); border: 1px solid rgba(26,127,116,0.15); }
  .adm-alert-error   { background: var(--red-lt); color: var(--red); border: 1px solid rgba(192,57,43,0.15); }

  /* ── Toast ── */
  .adm-toast {
    position: fixed;
    bottom: 28px;
    right: 28px;
    z-index: 1000;
    min-width: 320px;
    max-width: 480px;
    background: var(--ink);
    color: #fff;
    padding: 14px 20px;
    border-radius: var(--radius-sm);
    font-size: 13.5px;
    line-height: 1.5;
    box-shadow: var(--shadow-lg);
    display: flex;
    align-items: flex-start;
    gap: 12px;
    animation: slideUp 0.25s cubic-bezier(0.4,0,0.2,1);
  }
  .adm-toast-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
  .adm-toast-close {
    margin-left: auto;
    background: none;
    border: none;
    color: rgba(255,255,255,0.5);
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    padding: 0 0 0 12px;
    flex-shrink: 0;
  }
  .adm-toast-close:hover { color: #fff; }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Form grid ── */
  .adm-form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  /* ── School context card ── */
  .adm-school-card {
    background: linear-gradient(135deg, var(--ink) 0%, #1e1e30 100%);
    border-radius: var(--radius);
    padding: 24px 28px;
    color: #fff;
    position: relative;
    overflow: hidden;
    box-shadow: var(--shadow-md);
  }
  .adm-school-card::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 180px; height: 180px;
    border-radius: 50%;
    background: rgba(200,169,110,0.08);
  }
  .adm-school-card::after {
    content: '';
    position: absolute;
    bottom: -20px; right: 60px;
    width: 100px; height: 100px;
    border-radius: 50%;
    background: rgba(200,169,110,0.04);
  }
  .adm-school-card-label {
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--gold-dim);
    margin-bottom: 8px;
  }
  .adm-school-card-name {
    font-family: var(--font-serif);
    font-size: 1.5rem;
    color: #fff;
    letter-spacing: -0.3px;
  }
  .adm-school-card-id {
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    margin-top: 6px;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .adm-shell { grid-template-columns: 1fr; }
    .adm-sidebar { display: none; }
    .adm-grid-3 { grid-template-columns: 1fr; }
    .adm-grid-2 { grid-template-columns: 1fr; }
    .adm-content { padding: 20px; }
  }

  /* ── Tab system ── */
  .adm-tabs {
    display: flex;
    gap: 2px;
    background: var(--surface-3);
    padding: 3px;
    border-radius: var(--radius-sm);
    width: fit-content;
  }
  .adm-tab {
    padding: 7px 18px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 450;
    color: var(--ink-faint);
    cursor: pointer;
    border: none;
    background: transparent;
    transition: all var(--transition);
    font-family: var(--font-sans);
  }
  .adm-tab:hover { color: var(--ink-muted); }
  .adm-tab.active {
    background: var(--surface-2);
    color: var(--ink);
    font-weight: 500;
    box-shadow: var(--shadow-sm);
  }
`;

/* ─────────────────────────── Icon primitives ─────────────────────────── */
const Icon = ({ d, size = 18, stroke = "currentColor", strokeWidth = 1.5, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  classes: "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z",
  teachers: "M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
  import: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  modules: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  check: "M20 6L9 17l-5-5",
  x: "M18 6L6 18M6 6l12 12",
  plus: "M12 5v14M5 12h14",
  building: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
};

/* ─────────────────────────── Sub-components ─────────────────────────── */
function Field({ label, hint, error, children }) {
  return (
    <div className="adm-field">
      {label && <label className="adm-label">{label}</label>}
      {children}
      {(hint || error) && <p className={`adm-hint ${error ? "error" : ""}`}>{error || hint}</p>}
    </div>
  );
}

function Input({ error, ...props }) {
  return <input className={`adm-input ${error ? "error" : ""}`} {...props} />;
}

function NavItem({ icon, label, active, href, onClick }) {
  return (
    <a className={`adm-nav-item ${active ? "active" : ""}`} href={href || "#"} onClick={onClick} style={{ cursor: href ? "pointer" : "default" }}>
      <span className="adm-nav-icon"><Icon d={icons[icon]} size={16} strokeWidth={1.8} /></span>
      {label}
    </a>
  );
}

/* ─────────────────────────── Main Component ─────────────────────────── */
export default function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem("profile")); } catch { return null; }
  });
  const orgContext = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("org_context") || "null"); } catch { return null; }
  }, []);

  const [schools, setSchools] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState("");
  const [importing, setImporting] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [selectedClassroomViewId, setSelectedClassroomViewId] = useState(null);
  const [selectedClassroomDetails, setSelectedClassroomDetails] = useState(null);

  const [newClassName, setNewClassName] = useState("");
  const [newStudentUsername, setNewStudentUsername] = useState("");
  const [newStudentPassword, setNewStudentPassword] = useState("");
  const [newStudentFullName, setNewStudentFullName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentClassroomId, setNewStudentClassroomId] = useState("");
  const [newTeacherUsername, setNewTeacherUsername] = useState("");
  const [newTeacherPassword, setNewTeacherPassword] = useState("");
  const [newTeacherFullName, setNewTeacherFullName] = useState("");
  const [newTeacherEmail, setNewTeacherEmail] = useState("");
  const [newTeacherClassroomId, setNewTeacherClassroomId] = useState("");
  const [excelFile, setExcelFile] = useState(null);

  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("student");
  const [creatingUser, setCreatingUser] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState(null); // { msg, type }

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5500);
  };

  useEffect(() => {
    if (!token) return;
    apiFetch("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        setProfile(d);
        localStorage.setItem("profile", JSON.stringify(d));
        if (d?.role === "superadmin") window.location.href = "/dashboard/superadmin";
      })
      .catch(() => null);
  }, [token]);

  async function loadSchools() {
    if (!token) return;
    try {
      const res = await apiFetch("/admin/schools", { headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      setSchools(Array.isArray(d) ? d : []);
    } catch { setSchools([]); }
  }

  useEffect(() => { loadSchools(); }, [token]);

  useEffect(() => {
    if (!profile || selectedSchoolId) return;
    if ((profile.role === "admin" || profile.role === "school") && profile.school_id) {
      setSelectedSchoolId(Number(profile.school_id)); return;
    }
    if (schools.length > 0) setSelectedSchoolId(schools[0].id);
  }, [profile, schools, selectedSchoolId]);

  useEffect(() => {
    if (!token || !selectedSchoolId) return;
    const h = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    apiFetch(`/schools/${selectedSchoolId}/classrooms`, { headers: h }).then(r => r.json()).then(d => setClassrooms(Array.isArray(d) ? d : [])).catch(() => setClassrooms([]));
    apiFetch(`/schools/${selectedSchoolId}/students`, { headers: h }).then(r => r.json()).then(d => setStudents(Array.isArray(d) ? d : [])).catch(() => setStudents([]));
    apiFetch(`/schools/${selectedSchoolId}/teachers`, { headers: h }).then(r => r.json()).then(d => setTeachers(Array.isArray(d) ? d : [])).catch(() => setTeachers([]));
  }, [token, selectedSchoolId]);

  useEffect(() => {
    if (!selectedClassroomViewId) {
      setSelectedClassroomDetails(null);
      return;
    }
    if (!token) return;
    apiFetch(`/classrooms/${selectedClassroomViewId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setSelectedClassroomDetails(d?.id ? d : null))
      .catch(() => setSelectedClassroomDetails(null));
  }, [token, selectedClassroomViewId]);

  useEffect(() => {
    if (!classrooms.length) {
      setSelectedClassroomViewId(null);
      return;
    }
    if (!selectedClassroomViewId || !classrooms.some(c => Number(c.id) === Number(selectedClassroomViewId))) {
      setSelectedClassroomViewId(classrooms[0].id);
    }
  }, [classrooms, selectedClassroomViewId]);

  async function createClass() {
    if (!token || !selectedSchoolId || !newClassName.trim()) return;
    const res = await apiFetch(`/schools/${selectedSchoolId}/classrooms`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: newClassName }),
    });
    const data = await res.json();
    if (!res.ok) { showToast(data?.detail || "Could not create classroom", "error"); return; }
    if (data?.id) {
      setClassrooms(c => [data, ...c]);
      setSelectedClassroomViewId(data.id);
      showToast(`Classroom "${newClassName}" created.`);
    }
    setNewClassName("");
  }

  async function createStudent() {
    if (!token || !selectedSchoolId || !newStudentFullName.trim() || !newStudentUsername.trim()) return;
    const res = await apiFetch(`/organisation/users`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        username: newStudentUsername.trim(),
        password: newStudentPassword || undefined,
        full_name: newStudentFullName.trim(),
        email: newStudentEmail || undefined,
        role: "student",
        school_id: selectedSchoolId,
        classroom_id: newStudentClassroomId ? Number(newStudentClassroomId) : undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) { showToast(data?.detail || "Could not create student", "error"); return; }
    const listRes = await apiFetch(`/schools/${selectedSchoolId}/students`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    const listData = await listRes.json();
    setStudents(Array.isArray(listData) ? listData : []);
    setNewStudentUsername(""); setNewStudentPassword(""); setNewStudentFullName(""); setNewStudentEmail(""); setNewStudentClassroomId("");
    showToast(`Student "${data?.user?.username || newStudentUsername}" created.`);
  }

  async function createTeacher() {
    if (!token || !selectedSchoolId || !newTeacherUsername || !newTeacherPassword) return;
    const res = await apiFetch(`/schools/${selectedSchoolId}/teachers`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        username: newTeacherUsername,
        password: newTeacherPassword,
        full_name: newTeacherFullName || undefined,
        email: newTeacherEmail || undefined,
        classroom_id: newTeacherClassroomId ? Number(newTeacherClassroomId) : undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) { showToast(data?.detail || "Could not create teacher", "error"); return; }
    setTeachers(t => [data, ...t]);
    if (data?.classroom_id) {
      const refreshed = await apiFetch(`/schools/${selectedSchoolId}/classrooms`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const refreshedData = await refreshed.json();
      setClassrooms(Array.isArray(refreshedData) ? refreshedData : []);
      setSelectedClassroomViewId(data.classroom_id);
    }
    showToast(`Teacher "${newTeacherUsername}" added.`);
    setNewTeacherUsername(""); setNewTeacherPassword(""); setNewTeacherFullName(""); setNewTeacherEmail(""); setNewTeacherClassroomId("");
  }

  async function deleteClassroom(classroomId, classroomName) {
    if (!token) return;
    const res = await apiFetch(`/classrooms/${classroomId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      showToast(data?.detail || "Could not delete classroom", "error");
      return;
    }
    setClassrooms(current => current.filter(c => Number(c.id) !== Number(classroomId)));
    setStudents(current => current.map(s => Number(s.classroom_id) === Number(classroomId) ? { ...s, classroom_id: null } : s));
    showToast(`Classroom "${classroomName}" deleted.`);
  }

  async function deleteStudent(studentId) {
    if (!token) return;
    const res = await apiFetch(`/students/${studentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      showToast(data?.detail || "Could not delete student", "error");
      return;
    }
    setStudents(current => current.filter(s => Number(s.id) !== Number(studentId)));
    showToast("Student removed.");
  }

  async function deleteTeacher(teacherId) {
    if (!token) return;
    const res = await apiFetch(`/teachers/${teacherId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      showToast(data?.detail || "Could not delete teacher", "error");
      return;
    }
    setTeachers(current => current.filter(t => Number(t.id) !== Number(teacherId)));
    const refreshed = await apiFetch(`/schools/${selectedSchoolId}/classrooms`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    const refreshedData = await refreshed.json();
    setClassrooms(Array.isArray(refreshedData) ? refreshedData : []);
    showToast("Teacher removed.");
  }

  async function createUser() {
    if (!token || !selectedSchoolId) return;
    const errors = {};
    if (newUserUsername && newUserUsername.trim().length < 3) errors.username = "Minimum 3 characters";
    if (newUserPassword && newUserPassword.length < 6) errors.password = "Minimum 6 characters";
    if (!newUserFullName?.trim()) errors.full_name = "Full name is required";
    if (newUserEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newUserEmail)) errors.email = "Invalid email";
    if (Object.keys(errors).length) { setFormErrors(errors); return; }
    setFormErrors({});
    setCreatingUser(true);
    try {
      const payload = {
        username: newUserUsername.trim() || undefined,
        password: newUserPassword || undefined,
        full_name: newUserFullName.trim(),
        email: newUserEmail || undefined,
        role: newUserRole,
        school_id: selectedSchoolId,
      };
      const res = await apiFetch("/organisation/users", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data?.detail || data?.raw || "Create user failed", "error"); return; }
      setNewUserUsername(""); setNewUserPassword(""); setNewUserFullName(""); setNewUserEmail(""); setNewUserRole("student");
      const cu = data?.user || data;
      const extra = data?.credentials?.generated_password ? ` Temp password: ${data.credentials.password}` : "";
      showToast(`${cu?.username || payload.username} (${cu?.role || payload.role}) created.${extra}`);
    } finally { setCreatingUser(false); }
  }

  async function importStudentsExcel() {
    if (!token || !selectedSchoolId || !excelFile) return;
    setImportError(""); setImportResult(null); setImporting(true);
    try {
      const form = new FormData();
      form.append("file", excelFile);
      const res = await apiFetch(`/imports/students?school_id=${selectedSchoolId}`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Import failed");
      setImportResult(data);
      const sr = await apiFetch(`/schools/${selectedSchoolId}/students`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });
      setStudents(await sr.json());
      showToast(`Imported ${data.processed} records successfully.`);
    } catch (err) {
      setImportError(err.message);
      showToast(err.message, "error");
    } finally { setImporting(false); setExcelFile(null); }
  }

  if (!token) { window.location.href = "/login"; return null; }

  const templateUrl = `${getApiBaseUrl()}/imports/students/template`;
  const selectedSchool = schools.find(s => s.id === Number(selectedSchoolId));
  const orgLabel = orgContext?.name || orgContext?.code || (profile?.tenant_id ? `Org #${profile.tenant_id}` : null);
  const userInitial = (profile?.username || profile?.full_name || "A")[0].toUpperCase();
  const classroomNameById = classrooms.reduce((acc, classroom) => {
    acc[classroom.id] = classroom.name;
    return acc;
  }, {});

  const tabs = [
    { id: "users", label: "Create User" },
    { id: "classes", label: "Classrooms" },
    { id: "students", label: "Students" },
    { id: "teachers", label: "Teachers" },
    { id: "import", label: "Import" },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="adm-shell">

        {/* ── Sidebar ── */}
        <aside className="adm-sidebar">
          <div className="adm-logo">
            <div className="adm-logo-mark">
              <span className="adm-logo-dot" />
              Organisation
            </div>
            <div className="adm-logo-sub">Admin Dashboard</div>
          </div>

          <nav className="adm-nav">
            <div className="adm-nav-section">Navigation</div>
            <NavItem icon="dashboard" label="Overview" active />
            <NavItem icon="users" label="Users & Roles" />
            <NavItem icon="classes" label="Classrooms" />
            <NavItem icon="teachers" label="Teachers" />
            <NavItem icon="import" label="Imports" />
            <div className="adm-nav-section" style={{ marginTop: 8 }}>Links</div>
            <NavItem icon="modules" label="Modules" href="/modules" />
          </nav>

          <div className="adm-sidebar-footer">
            <div className="adm-user-chip">
              <div className="adm-user-avatar">{userInitial}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="adm-user-name">{profile?.username || profile?.full_name || "Admin"}</div>
                <div className="adm-user-role">{profile?.role || "admin"}</div>
              </div>
              <button
                onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("profile"); window.location.href = "/login"; }}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", padding: 4, flexShrink: 0 }}
                title="Logout"
              >
                <Icon d={icons.logout} size={15} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="adm-main">
          <header className="adm-topbar">
            <div className="adm-breadcrumb">
              Organisation <span style={{ color: "var(--ink-faint)" }}>›</span> <span>Dashboard</span>
            </div>
            <div className="adm-topbar-actions">
              {orgLabel && (
                <div className="adm-org-banner" style={{ padding: "6px 12px", fontSize: "12px" }}>
                  <span className="adm-org-banner-dot" />
                  {orgLabel}
                </div>
              )}
              <a href="/modules" className="adm-btn adm-btn-ghost adm-btn-sm">
                <Icon d={icons.modules} size={14} strokeWidth={1.8} /> Modules
              </a>
              <button
                className="adm-btn adm-btn-danger adm-btn-sm"
                onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("profile"); window.location.href = "/login"; }}
              >
                <Icon d={icons.logout} size={14} strokeWidth={1.8} /> Logout
              </button>
            </div>
          </header>

          <div className="adm-content">

            {/* Page header */}
            <div className="adm-page-header">
              <div>
                <h1 className="adm-page-title">Organisation <em>Operations</em></h1>
                <p className="adm-page-sub">Manage users, classrooms, teachers, and student records from a single unified dashboard.</p>
              </div>
            </div>

            {/* School context + Stats */}
            <div className="adm-grid-2" style={{ gridTemplateColumns: "1fr 2fr" }}>
              <div className="adm-school-card">
                <div className="adm-school-card-label">Active School</div>
                <div className="adm-school-card-name">{selectedSchool?.name || "Not selected"}</div>
                <div className="adm-school-card-id">
                  {selectedSchoolId ? `School ID: ${selectedSchoolId}` : "No school linked — contact superadmin"}
                </div>
                {profile?.role && (
                  <span className="adm-badge adm-badge-gold" style={{ marginTop: 14 }}>{profile.role}</span>
                )}
              </div>

              <div className="adm-stats-row">
                <div className="adm-stat">
                  <div className="adm-stat-label">Classrooms</div>
                  <div className="adm-stat-value">{classrooms.length}</div>
                  <div className="adm-stat-sub">Active rooms</div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-label">Students</div>
                  <div className="adm-stat-value">{students.length}</div>
                  <div className="adm-stat-sub">Enrolled</div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-label">Teachers</div>
                  <div className="adm-stat-value">{teachers.length}</div>
                  <div className="adm-stat-sub">On staff</div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-label">School ID</div>
                  <div className="adm-stat-value" style={{ fontSize: "1.5rem" }}>{selectedSchoolId || "—"}</div>
                  <div className="adm-stat-sub">Identifier</div>
                </div>
              </div>
            </div>

            {selectedSchoolId ? (
              <>
                {/* Tab panel */}
                <div>
                  <div className="adm-tabs">
                    {tabs.map(t => (
                      <button key={t.id} className={`adm-tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ marginTop: 18 }}>

                    {/* ── Create User ── */}
                    {activeTab === "users" && (
                      <div className="adm-panel">
                        <div className="adm-panel-head">
                          <div className="adm-panel-title">Create Organisation User</div>
                          <div className="adm-panel-sub">Provision role-based accounts with login credentials for your organisation.</div>
                          <div className="adm-panel-divider" />
                        </div>
                        <div className="adm-panel-body">
                          <div className="adm-section-label">Identity</div>
                          <div className="adm-form-grid" style={{ marginBottom: 16 }}>
                            <Field label="Full name" error={formErrors.full_name}>
                              <Input placeholder="Jane Smith" value={newUserFullName} onChange={e => setNewUserFullName(e.target.value)} error={!!formErrors.full_name} />
                            </Field>
                            <Field label="Role">
                              <select className="adm-input adm-select" value={newUserRole} onChange={e => setNewUserRole(e.target.value)}>
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="parent">Parent</option>
                                <option value="accountant">Accountant</option>
                                <option value="librarian">Librarian</option>
                              </select>
                            </Field>
                            <Field label="Email" hint="Optional">
                              <Input type="email" placeholder="jane@school.edu" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} error={!!formErrors.email} />
                            </Field>
                          </div>
                          <div className="adm-section-label">Credentials</div>
                          <div className="adm-form-grid">
                            <Field label="Username" hint="Minimum 6 characters" error={formErrors.username}>
                              <Input placeholder="jsmith" value={newUserUsername} onChange={e => setNewUserUsername(e.target.value)} error={!!formErrors.username} />
                            </Field>
                            <Field label="Password" hint="Leave empty to auto-generate" error={formErrors.password}>
                              <Input type="password" placeholder="••••••••" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} error={!!formErrors.password} />
                            </Field>
                          </div>
                          <div style={{ marginTop: 20 }}>
                            <button className="adm-btn adm-btn-gold" onClick={createUser} disabled={creatingUser}>
                              <Icon d={icons.plus} size={15} strokeWidth={2} />
                              {creatingUser ? "Creating user…" : "Create user credentials"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Classrooms ── */}
                    {activeTab === "classes" && (
                      <div className="adm-panel">
                        <div className="adm-panel-head">
                          <div className="adm-panel-title">Classrooms</div>
                          <div className="adm-panel-sub">Create classrooms, review student counts, and open a classroom to see its student list.</div>
                          <div className="adm-panel-divider" />
                        </div>
                        <div className="adm-panel-body">
                          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                            <Field label="Class name" style={{ flex: 1 }}>
                              <Input placeholder="e.g. Grade 5 — Section A" value={newClassName} onChange={e => setNewClassName(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && createClass()} style={{ flex: 1 }} />
                            </Field>
                            <button className="adm-btn adm-btn-primary" onClick={createClass} style={{ flexShrink: 0, height: 42 }}>
                              <Icon d={icons.plus} size={15} strokeWidth={2} /> Add classroom
                            </button>
                          </div>
                          {classrooms.length === 0 ? (
                            <div className="adm-list-empty" style={{ marginTop: 18 }}>No classrooms yet.</div>
                          ) : (
                            <>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginTop: 18 }}>
                                {classrooms.map(c => (
                                  <div
                                    key={c.id}
                                    onClick={() => setSelectedClassroomViewId(c.id)}
                                    style={{
                                      border: Number(selectedClassroomViewId) === Number(c.id) ? "1.5px solid var(--gold)" : "1px solid var(--border)",
                                      borderRadius: "var(--radius)",
                                      padding: "16px 18px",
                                      background: Number(selectedClassroomViewId) === Number(c.id) ? "var(--gold-bg)" : "var(--surface)",
                                      cursor: "pointer",
                                      boxShadow: "var(--shadow-sm)",
                                    }}
                                  >
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                      <div>
                                        <div style={{ fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>{c.name}</div>
                                        <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>Students: {c.student_count || 0}</div>
                                        <div style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 4 }}>
                                          Class teacher: {c.class_teacher_name || "Not assigned"}
                                        </div>
                                      </div>
                                      <button
                                        className="adm-btn adm-btn-danger adm-btn-sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteClassroom(c.id, c.name);
                                        }}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div style={{ marginTop: 22, borderTop: "1px solid var(--border)", paddingTop: 18 }}>
                                <div className="adm-section-label">Selected classroom</div>
                                {!selectedClassroomDetails ? (
                                  <div className="adm-list-empty">Choose a classroom to see its students.</div>
                                ) : (
                                  <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                                      <div>
                                        <div style={{ fontWeight: 600, fontSize: 18 }}>{selectedClassroomDetails.name}</div>
                                        <div style={{ fontSize: 13, color: "var(--ink-faint)", marginTop: 4 }}>
                                          Class teacher: {selectedClassroomDetails.class_teacher_name || "Not assigned"}
                                        </div>
                                      </div>
                                      <span className="adm-badge adm-badge-teal">{selectedClassroomDetails.student_count || 0} students</span>
                                    </div>
                                    <div className="adm-list">
                                      {selectedClassroomDetails.students?.length
                                        ? selectedClassroomDetails.students.map(student => (
                                            <div className="adm-list-item" key={student.id}>
                                              <span className="adm-list-item-dot" />
                                              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                                <span>{student.full_name || student.username || `Student #${student.id}`}</span>
                                                <span style={{ color: "var(--ink-faint)", fontSize: 12 }}>
                                                  {student.username || "No username"}
                                                </span>
                                              </div>
                                            </div>
                                          ))
                                        : <div className="adm-list-empty">No students assigned to this classroom.</div>}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ── Students ── */}
                    {activeTab === "students" && (
                      <div className="adm-panel">
                        <div className="adm-panel-head">
                          <div className="adm-panel-title">Students</div>
                          <div className="adm-panel-sub">Create student accounts for this school and assign them to classrooms.</div>
                          <div className="adm-panel-divider" />
                        </div>
                        <div className="adm-panel-body">
                          <div className="adm-form-grid" style={{ marginBottom: 16 }}>
                            <Field label="Full name">
                              <Input placeholder="Student name" value={newStudentFullName} onChange={e => setNewStudentFullName(e.target.value)} />
                            </Field>
                            <Field label="Username">
                              <Input placeholder="student_username" value={newStudentUsername} onChange={e => setNewStudentUsername(e.target.value)} />
                            </Field>
                            <Field label="Password">
                              <Input type="password" placeholder="Leave empty to auto-generate" value={newStudentPassword} onChange={e => setNewStudentPassword(e.target.value)} />
                            </Field>
                            <Field label="Email">
                              <Input type="email" placeholder="student@school.edu" value={newStudentEmail} onChange={e => setNewStudentEmail(e.target.value)} />
                            </Field>
                            <Field label="Classroom">
                              <select className="adm-input adm-select" value={newStudentClassroomId} onChange={e => setNewStudentClassroomId(e.target.value)}>
                                <option value="">Unassigned</option>
                                {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                            </Field>
                          </div>
                          <button className="adm-btn adm-btn-primary" onClick={createStudent} style={{ height: 42 }}>
                            <Icon d={icons.plus} size={15} strokeWidth={2} /> Create student
                          </button>
                          <div className="adm-list" style={{ marginTop: 16 }}>
                            {students.length === 0
                              ? <div className="adm-list-empty">No students yet.</div>
                              : students.map(s => (
                                  <div className="adm-list-item" key={s.id} style={{ alignItems: "center" }}>
                                    <span className="adm-list-item-dot" />
                                    <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                                      <span>{s.full_name || s.username || `Student #${s.id}`}</span>
                                      <span style={{ color: "var(--ink-faint)", fontSize: 12 }}>
                                        {s.username || "No username"} {classroomNameById[s.classroom_id] ? `• ${classroomNameById[s.classroom_id]}` : "• Unassigned"}
                                      </span>
                                    </div>
                                    <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => deleteStudent(s.id)}>
                                      Delete
                                    </button>
                                  </div>
                                ))
                            }
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Teachers ── */}
                    {activeTab === "teachers" && (
                      <div className="adm-panel">
                        <div className="adm-panel-head">
                          <div className="adm-panel-title">Teachers</div>
                          <div className="adm-panel-sub">Create teacher accounts and optionally assign them as class teachers.</div>
                          <div className="adm-panel-divider" />
                        </div>
                        <div className="adm-panel-body">
                          <div className="adm-form-grid" style={{ marginBottom: 16 }}>
                            <Field label="Full name">
                              <Input placeholder="Teacher name" value={newTeacherFullName} onChange={e => setNewTeacherFullName(e.target.value)} />
                            </Field>
                            <Field label="Username">
                              <Input placeholder="teacher_name" value={newTeacherUsername} onChange={e => setNewTeacherUsername(e.target.value)} />
                            </Field>
                            <Field label="Email">
                              <Input type="email" placeholder="teacher@school.edu" value={newTeacherEmail} onChange={e => setNewTeacherEmail(e.target.value)} />
                            </Field>
                            <Field label="Password">
                              <Input type="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" value={newTeacherPassword} onChange={e => setNewTeacherPassword(e.target.value)} />
                            </Field>
                            <Field label="Class teacher for">
                              <select className="adm-input adm-select" value={newTeacherClassroomId} onChange={e => setNewTeacherClassroomId(e.target.value)}>
                                <option value="">No classroom assignment</option>
                                {classrooms.map(c => (
                                  <option key={c.id} value={c.id} disabled={!!c.class_teacher_user_id}>
                                    {c.name}{c.class_teacher_name ? " • already assigned" : ""}
                                  </option>
                                ))}
                              </select>
                            </Field>
                          </div>
                          <button className="adm-btn adm-btn-primary" onClick={createTeacher} style={{ height: 42 }}
                            disabled={!newTeacherUsername || !newTeacherPassword}>
                            <Icon d={icons.plus} size={15} strokeWidth={2} /> Add teacher
                          </button>
                          <div className="adm-list" style={{ marginTop: 16 }}>
                            {teachers.length === 0
                              ? <div className="adm-list-empty">No teachers added yet.</div>
                              : teachers.map(t => (
                                  <div className="adm-list-item" key={t.id} style={{ alignItems: "center" }}>
                                    <span className="adm-list-item-dot" />
                                    <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                                      <span>{t.full_name || t.username || `Teacher #${t.id}`}</span>
                                      <span style={{ color: "var(--ink-faint)", fontSize: 12 }}>
                                        {t.username || "No username"} {t.classroom_name ? `• Class teacher: ${t.classroom_name}` : ""}
                                      </span>
                                    </div>
                                    <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => deleteTeacher(t.id)}>
                                      Delete
                                    </button>
                                  </div>
                                ))
                            }
                          </div>
                        </div>
                      </div>
                    )}

                    {false && activeTab === "teachers" && (
                      <div className="adm-panel">
                        <div className="adm-panel-head">
                          <div className="adm-panel-title">Add Teacher</div>
                          <div className="adm-panel-sub">Create teacher accounts and assign them to this school.</div>
                          <div className="adm-panel-divider" />
                        </div>
                        <div className="adm-panel-body">
                          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
                            <Field label="Username" style={{ flex: 1, minWidth: 160 }}>
                              <Input placeholder="teacher_name" value={newTeacherUsername} onChange={e => setNewTeacherUsername(e.target.value)} />
                            </Field>
                            <Field label="Password" style={{ flex: 1, minWidth: 160 }}>
                              <Input type="password" placeholder="••••••••" value={newTeacherPassword} onChange={e => setNewTeacherPassword(e.target.value)} />
                            </Field>
                            <button className="adm-btn adm-btn-primary" onClick={createTeacher} style={{ flexShrink: 0, height: 42 }}
                              disabled={!newTeacherUsername || !newTeacherPassword}>
                              <Icon d={icons.plus} size={15} strokeWidth={2} /> Add teacher
                            </button>
                          </div>
                          <div className="adm-list" style={{ marginTop: 16 }}>
                            {teachers.length === 0
                              ? <div className="adm-list-empty">No teachers added yet.</div>
                              : teachers.map(t => (
                                  <div className="adm-list-item" key={t.id}>
                                    <span className="adm-list-item-dot" />
                                    {t.username || `Teacher #${t.id}`}
                                    <span className="adm-badge adm-badge-teal" style={{ marginLeft: "auto" }}>teacher</span>
                                  </div>
                                ))
                            }
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Import ── */}
                    {activeTab === "import" && (
                      <div className="adm-panel">
                        <div className="adm-panel-head">
                          <div className="adm-panel-title">Student Excel Import</div>
                          <div className="adm-panel-sub">Download the template, fill in student data, and upload to batch-import records.</div>
                          <div className="adm-panel-divider" />
                        </div>
                        <div className="adm-panel-body">
                          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                            <a href={templateUrl} target="_blank" rel="noreferrer" className="adm-btn adm-btn-ghost adm-btn-sm">
                              <Icon d={icons.import} size={14} strokeWidth={1.8} /> Download template
                            </a>
                          </div>
                          <div className="adm-upload-zone">
                            <Icon d={icons.import} size={20} strokeWidth={1.5} style={{ color: "var(--ink-faint)", flexShrink: 0 }} />
                            <input type="file" accept=".xlsx,.xls" onChange={e => setExcelFile(e.target.files?.[0] || null)} />
                          </div>
                          <div style={{ marginTop: 14 }}>
                            <button className="adm-btn adm-btn-gold" onClick={importStudentsExcel} disabled={importing || !excelFile}>
                              <Icon d={icons.import} size={15} strokeWidth={2} />
                              {importing ? "Importing…" : "Import students"}
                            </button>
                          </div>
                          {importError && (
                            <div className="adm-alert adm-alert-error">
                              <Icon d={icons.x} size={15} strokeWidth={2} />
                              {importError}
                            </div>
                          )}
                          {importResult && (
                            <div className="adm-import-stats">
                              {[
                                { label: "Processed", value: importResult.processed },
                                { label: "Created Users", value: importResult.created_users },
                                { label: "Updated Users", value: importResult.updated_users },
                                { label: "Created Students", value: importResult.created_students },
                                { label: "Linked", value: importResult.linked_students },
                                { label: "Errors", value: (importResult.errors || []).length, err: true },
                              ].map(item => (
                                <div key={item.label} className={`adm-import-stat ${item.err && item.value > 0 ? "err" : ""}`}>
                                  <div className="adm-import-stat-value">{item.value ?? 0}</div>
                                  <div className="adm-import-stat-label">{item.label}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </>
            ) : (
              <div className="adm-panel">
                <div className="adm-panel-body" style={{ textAlign: "center", padding: "40px 28px", color: "var(--ink-faint)", fontSize: 14 }}>
                  No school is linked to this account yet. Please contact your superadmin.
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className="adm-toast">
          <span className="adm-toast-icon">{toast.type === "error" ? "✕" : "✓"}</span>
          <span>{toast.msg}</span>
          <button className="adm-toast-close" onClick={() => setToast(null)}>×</button>
        </div>
      )}
    </>
  );
}
