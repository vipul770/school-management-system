import React from "react";
import Button from "@mui/material/Button";
import { MODULES, canReadModule, FREE_MODULE_SLUGS, isPremiumModule } from "../../utils/modulesConfig";
import { getDashboardPath } from "../../utils/dashboardPath";

function getProfile() {
  try {
    return JSON.parse(localStorage.getItem("profile") || "null");
  } catch {
    return null;
  }
}

export default function ModuleCenter() {
  const token = localStorage.getItem("token");
  const profile = getProfile();
  const includedModules = MODULES.filter((m) => canReadModule(profile?.role, m.slug));
  const premiumModules = MODULES.filter((m) => isPremiumModule(m.slug) && !canReadModule(profile?.role, m.slug));
  const isPrivilegedRole = ["superadmin", "admin", "school"].includes(profile?.role);
  const dashboardPath = getDashboardPath(profile);

  if (!token) {
    return (
      <div className="app-shell">
        <div className="panel">Please <a href="/login">login</a> to continue.</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="topbar">
        <div>
          <h2 style={{ margin: 0 }}>Modules</h2>
          <p className="panel-subtitle" style={{ margin: "6px 0 0" }}>
            Included modules are available now. Other modules are listed as premium.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button href={dashboardPath} variant="outlined">
            Back Dashboard
          </Button>
        </div>
      </div>

      <section className="panel" style={{ marginBottom: 16 }}>
        <h3 className="panel-title" style={{ marginBottom: 8 }}>Included Modules</h3>
        <p className="panel-subtitle" style={{ marginTop: 0 }}>
          Standard access includes {FREE_MODULE_SLUGS.length} modules: Admissions, Classrooms, Students, Teachers, Attendance, Exams and Timetable.
        </p>
      </section>

      <section className="split-grid">
        {includedModules.map((mod) => (
          <article key={mod.slug} className="panel col-4">
            <h3 className="panel-title">{mod.title}</h3>
            <p className="panel-subtitle">Endpoint group: `{mod.slug}`</p>
            <Button href={`/modules/${mod.slug}`} variant="contained">
              Open {mod.title}
            </Button>
          </article>
        ))}
        {includedModules.length === 0 ? (
          <article className="panel col-12">
            <p className="panel-subtitle">No modules assigned for your role.</p>
          </article>
        ) : null}
      </section>

      {!isPrivilegedRole && premiumModules.length > 0 ? (
        <section style={{ marginTop: 24 }}>
          <div className="topbar" style={{ marginBottom: 12 }}>
            <div>
              <h3 style={{ margin: 0 }}>Premium Modules</h3>
              <p className="panel-subtitle" style={{ margin: "6px 0 0" }}>
                These modules are available only in the premium category.
              </p>
            </div>
          </div>
          <div className="split-grid">
            {premiumModules.map((mod) => (
              <article key={mod.slug} className="panel col-4" style={{ opacity: 0.82 }}>
                <h3 className="panel-title">{mod.title}</h3>
                <p className="panel-subtitle">Premium module</p>
                <Button variant="outlined" disabled>
                  Premium Only
                </Button>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
