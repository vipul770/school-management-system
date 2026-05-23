import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { apiFetch } from "../../services/api";
import { getDashboardPath } from "../../utils/dashboardPath";

export default function StudentDashboard() {
  const token = localStorage.getItem("token");
  const profile = localStorage.getItem("profile") ? JSON.parse(localStorage.getItem("profile")) : null;
  const [activities, setActivities] = useState(null);

  useEffect(() => {
    if (!token) return;
    if (profile?.role !== "student") {
      window.location.href = getDashboardPath(profile);
      return;
    }
    if (!profile?.school_id) return;
    apiFetch(`/schools/${profile.school_id}/activities`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setActivities(d))
      .catch(() => setActivities(null));
  }, [token, profile?.role, profile?.school_id]);

  if (!token) {
    return (
      <div className="app-shell">
        <div className="panel">Please <a href="/login">login</a> to view your dashboard.</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="topbar">
        <div>
          <h2 style={{ margin: 0 }}>Student Workspace</h2>
          <p className="panel-subtitle" style={{ margin: "6px 0 0" }}>
            Signed in as {profile?.username} ({profile?.role})
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button href="/modules" variant="contained">Modules</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("profile");
              window.location.href = "/login";
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      <section className="split-grid">
        <article className="panel col-4">
          <h3 className="panel-title">Profile</h3>
          <div className="list">
            <div className="list-item">Username: <strong>{profile?.username || "N/A"}</strong></div>
            <div className="list-item">Role: <strong>{profile?.role || "N/A"}</strong></div>
            <div className="list-item">School ID: <strong>{profile?.school_id || "Not linked"}</strong></div>
          </div>
        </article>
        <article className="panel col-8">
          <h3 className="panel-title">School Activity Snapshot</h3>
          {!profile?.school_id ? (
            <p className="panel-subtitle">No school is currently linked to this account.</p>
          ) : activities ? (
            <div className="metric-grid">
              <div className="metric"><p className="metric-label">Classrooms</p><p className="metric-value">{activities.classrooms?.length || 0}</p></div>
              <div className="metric"><p className="metric-label">Students</p><p className="metric-value">{activities.students?.length || 0}</p></div>
              <div className="metric"><p className="metric-label">School Id</p><p className="metric-value">{activities.school_id}</p></div>
            </div>
          ) : (
            <p className="panel-subtitle">Loading school activity...</p>
          )}
        </article>
      </section>
    </div>
  );
}

