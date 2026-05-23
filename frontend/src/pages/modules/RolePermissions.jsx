import React, { useMemo } from "react";
import Button from "@mui/material/Button";
import { MODULES, ROLE_ACCESS } from "../../utils/modulesConfig";

const ROLE_ORDER = ["superadmin", "admin", "school", "teacher", "student", "parent", "accountant", "librarian"];

function labelRole(role) {
  return role.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function moduleTitle(slug) {
  const mod = MODULES.find((m) => m.slug === slug);
  return mod ? mod.title : slug;
}

function renderScope(scope) {
  if (scope === "*") return "All Modules";
  if (!Array.isArray(scope) || scope.length === 0) return "None";
  return scope.map((slug) => moduleTitle(slug)).join(", ");
}

export default function RolePermissions() {
  const token = localStorage.getItem("token");
  const profile = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("profile") || "null");
    } catch {
      return null;
    }
  }, []);

  if (!token) {
    return (
      <div className="app-shell">
        <div className="panel">Please <a href="/login">login</a> to continue.</div>
      </div>
    );
  }

  if (profile?.role !== "superadmin") {
    return (
      <div className="app-shell">
        <div className="panel">
          <h3 className="panel-title">Access Restricted</h3>
          <p className="panel-subtitle">Only superadmin can view role permissions.</p>
          <Button href="/admin" variant="outlined">Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="topbar">
        <div>
          <h2 style={{ margin: 0 }}>Role Permissions</h2>
          <p className="panel-subtitle" style={{ margin: "6px 0 0" }}>
            One-page matrix for role based access in this system.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button href="/admin" variant="outlined">Back to Admin</Button>
          <Button href="/modules" variant="text">Modules</Button>
        </div>
      </div>

      <section className="panel">
        <h3 className="panel-title">Access Matrix</h3>
        <div className="list">
          {ROLE_ORDER.map((role) => {
            const policy = ROLE_ACCESS[role];
            if (!policy) return null;
            return (
              <div key={role} className="list-item">
                <strong>{labelRole(role)}</strong>
                <div style={{ marginTop: 6, fontSize: 13 }}>
                  <div><strong>Read:</strong> {renderScope(policy.read)}</div>
                  <div><strong>Write:</strong> {renderScope(policy.write)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
