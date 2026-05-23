import React, { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { apiFetch, readResponseData } from "../../services/api";

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    organisation_name: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const payload = {
        username: form.username.trim(),
        password: form.password,
        full_name: form.organisation_name.trim() || null,
        email: form.email.trim() || null,
        role: "school",
      };
      const res = await apiFetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await readResponseData(res);
      if (!res.ok) throw new Error(data?.detail || "Signup failed");
      setSuccess(data?.message || "Account request submitted for superadmin approval.");
      setForm((f) => ({ ...f, password: "" }));
      setTimeout(() => {
        window.location.href = "/login";
      }, 900);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <aside className="auth-art">
          <h1>Create School Account</h1>
          <p>Register your school organisation account. Superadmin approval is required before login.</p>
        </aside>
        <form className="auth-form" onSubmit={handleSignup}>
          <h2>Sign Up</h2>
          <p className="auth-hint">This signup is only for school role.</p>
          <TextField
            fullWidth
            label="Username"
            value={form.username}
            onChange={(e) => updateField("username", e.target.value)}
            required
          />
          <TextField
            fullWidth
            type="password"
            label="Password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Organisation Name"
            value={form.organisation_name}
            onChange={(e) => updateField("organisation_name", e.target.value)}
            required
          />
          <TextField fullWidth label="Email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
          {error ? <p className="error-text">{error}</p> : null}
          {success ? <p style={{ color: "var(--brand-deep)", margin: 0 }}>{success}</p> : null}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </Button>
            <Button href="/login" variant="outlined">
              Go to login
            </Button>
            {/* <Button href="/request-org" variant="text">
              Request organisation
            </Button> */}
            <Button href="/" variant="text">
              Back home
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
