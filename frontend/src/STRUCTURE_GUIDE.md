# Frontend Structure Guide

This frontend now uses a feature-aware structure:

- `pages/`: route-level screens grouped by domain.
- `components/`: reusable UI building blocks.
- `layouts/`: shell wrappers for auth and role dashboards.
- `services/`: API-facing modules and permission helpers.
- `store/`: state-management scaffolding for a future Redux Toolkit migration.
- `hooks/`: reusable React hooks.
- `utils/`: browser storage, formatting, routes, constants, and module metadata.

Current implementation note:
The project still uses a lightweight manual router in `main.jsx`. The new folders are ready for a later move to `react-router-dom` without another large file shuffle.
