import React, { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { apiFetch, readResponseData } from "../../services/api";

export default function RequestOrganisation() {
  const [form, setForm] = useState({ name: "", contact_email: "", details: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  function updateField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (!token) {
        setError("You must be signed in to submit an organisation request. Please sign in first.");
        setLoading(false);
        return;
      }
      const payload = { name: form.name.trim(), contact_email: form.contact_email.trim() || null, details: form.details || null };
      const res = await apiFetch("/requests/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
      });
      const data = await readResponseData(res);
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized: your session may have expired. Please sign in again.");
        throw new Error(data?.detail || data?.raw || "Request failed");
      }
      setSuccess("Organisation request submitted. Super admin will review it.");
      setForm({ name: "", contact_email: "", details: "" });
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <aside className="auth-art">
          <h1>Request Organisation</h1>
          <p>Ask Super Admin to create your organisation (tenant) and initial school account.</p>
        </aside>
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Organisation request</h2>
          <TextField fullWidth label="Organisation / School Name" value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
          <TextField fullWidth label="Contact email" value={form.contact_email} onChange={(e) => updateField("contact_email", e.target.value)} />
          <TextField fullWidth label="Details (optional)" value={form.details} onChange={(e) => updateField("details", e.target.value)} multiline rows={4} />
          {error ? <p className="error-text">{error}</p> : null}
          {success ? <p style={{ color: "var(--brand-deep)", margin: 0 }}>{success}</p> : null}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Submitting..." : "Submit request"}
            </Button>
            <Button href="/signup" variant="outlined">
              Back to signup
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
