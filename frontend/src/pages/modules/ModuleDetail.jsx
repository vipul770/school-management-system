import React, { useMemo, useState } from "react";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { apiFetch, getAuthHeaders, interpolatePath, schoolPath } from "../../services/api";
import { getModuleBySlug, canReadModule, canWriteModule } from "../../utils/modulesConfig";

function getProfile() {
  try {
    return JSON.parse(localStorage.getItem("profile") || "null");
  } catch {
    return null;
  }
}

function cloneTemplate(template) {
  return JSON.parse(JSON.stringify(template));
}

function normalizeValue(field, value) {
  if (field.type === "number") {
    if (value === "" || value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isNaN(n) ? value : n;
  }
  return value;
}

function validateForm(fields, form) {
  const errors = {};
  fields.forEach((field) => {
    if (!field.required) return;
    const val = form[field.name];
    if (val === null || val === undefined || String(val).trim() === "") {
      errors[field.name] = `${field.label} is required`;
    }
  });
  return errors;
}

function cleanPayload(fields, form) {
  const payload = {};
  fields.forEach((field) => {
    const val = normalizeValue(field, form[field.name]);
    if (val === "") {
      payload[field.name] = null;
    } else {
      payload[field.name] = val;
    }
  });
  return payload;
}

export default function ModuleDetail({ slug }) {
  const token = localStorage.getItem("token");
  const profile = getProfile();
  const moduleDef = useMemo(() => getModuleBySlug(slug), [slug]);
  const canRead = canReadModule(profile?.role, slug);
  const canWrite = canWriteModule(profile?.role, slug);
  const [schoolId, setSchoolId] = useState(profile?.school_id ? String(profile.school_id) : "");
  const [recordId, setRecordId] = useState("");
  const [createForm, setCreateForm] = useState(moduleDef ? cloneTemplate(moduleDef.template) : {});
  const [updateForm, setUpdateForm] = useState(moduleDef ? cloneTemplate(moduleDef.template) : {});
  const [createErrors, setCreateErrors] = useState({});
  const [updateErrors, setUpdateErrors] = useState({});
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!token) {
    return (
      <div className="app-shell">
        <div className="panel">Please <a href="/login">login</a> to continue.</div>
      </div>
    );
  }

  if (!moduleDef) {
    return (
      <div className="app-shell">
        <div className="panel">
          Unknown module.
          <div style={{ marginTop: 8 }}>
            <Button href="/modules" variant="outlined">Back to modules</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!canRead) {
    return (
      <div className="app-shell">
        <div className="panel">
          <h3 className="panel-title">Access Restricted</h3>
          <p className="panel-subtitle">Your role cannot access this module.</p>
          <Button href="/modules" variant="outlined">Back to modules</Button>
        </div>
      </div>
    );
  }

  async function runRequest(label, fn) {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await fn();
      setSuccess(label);
    } catch (err) {
      setError(err.message || "Request failed");
    } finally {
      setBusy(false);
    }
  }

  function requireSchoolPath(template) {
    if (!schoolId) throw new Error("School ID is required");
    return schoolPath(template, schoolId);
  }

  async function listItems() {
    await runRequest("List loaded", async () => {
      const res = await apiFetch(requireSchoolPath(moduleDef.listPath), {
        headers: getAuthHeaders(token),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail || `List failed (${res.status})`);
      setItems(Array.isArray(data) ? data : []);
    });
  }

  async function createItem() {
    if (!canWrite) return;
    const errors = validateForm(moduleDef.fields, createForm);
    setCreateErrors(errors);
    if (Object.keys(errors).length) return;

    await runRequest("Created successfully", async () => {
      const payload = cleanPayload(moduleDef.fields, createForm);
      const res = await apiFetch(requireSchoolPath(moduleDef.createPath), {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail || `Create failed (${res.status})`);
      setCreateForm(cloneTemplate(moduleDef.template));
      await listItems();
    });
  }

  async function updateItem() {
    if (!canWrite) return;
    if (!moduleDef.updatePath) return;
    if (!recordId) {
      setError("Record ID is required");
      return;
    }
    const errors = validateForm(moduleDef.fields, updateForm);
    setUpdateErrors(errors);
    if (Object.keys(errors).length) return;

    await runRequest("Updated successfully", async () => {
      const payload = cleanPayload(moduleDef.fields, updateForm);
      const res = await apiFetch(interpolatePath(moduleDef.updatePath, { id: recordId }), {
        method: "PUT",
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail || `Update failed (${res.status})`);
      await listItems();
    });
  }

  async function deleteItem() {
    if (!canWrite) return;
    if (!moduleDef.deletePath) return;
    if (!recordId) {
      setError("Record ID is required");
      return;
    }
    await runRequest("Deleted successfully", async () => {
      const res = await apiFetch(interpolatePath(moduleDef.deletePath, { id: recordId }), {
        method: "DELETE",
        headers: getAuthHeaders(token, false),
      });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || `Delete failed (${res.status})`);
      }
      setRecordId("");
      await listItems();
    });
  }

  function fillUpdate(item) {
    if (!item?.id) return;
    setRecordId(String(item.id));
    const next = cloneTemplate(moduleDef.template);
    moduleDef.fields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(item, field.name)) next[field.name] = item[field.name];
    });
    setUpdateForm(next);
    setUpdateErrors({});
  }

  function renderField(field, value, onChange, errors) {
    if (field.type === "select") {
      return (
        <TextField
          key={field.name}
          fullWidth
          select
          label={field.label}
          value={value ?? ""}
          onChange={(e) => onChange(field.name, e.target.value)}
          required={field.required}
          error={Boolean(errors[field.name])}
          helperText={errors[field.name] || ""}
        >
          <MenuItem value="">Select {field.label}</MenuItem>
          {field.options.map((opt) => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </TextField>
      );
    }

    return (
      <TextField
        key={field.name}
        fullWidth
        label={field.label}
        type={field.type === "date" || field.type === "time" || field.type === "number" ? field.type : "text"}
        value={value ?? ""}
        onChange={(e) => onChange(field.name, e.target.value)}
        required={field.required}
        error={Boolean(errors[field.name])}
        helperText={errors[field.name] || ""}
        multiline={field.multiline}
        minRows={field.multiline ? 3 : undefined}
        InputLabelProps={field.type === "date" || field.type === "time" ? { shrink: true } : undefined}
      />
    );
  }

  return (
    <div className="app-shell">
      <div className="topbar">
        <div>
          <h2 style={{ margin: 0 }}>{moduleDef.title}</h2>
          <p className="panel-subtitle" style={{ margin: "6px 0 0" }}>
            Field-level forms with validation and module CRUD.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button href="/modules" variant="outlined">All Modules</Button>
          <Button href={profile?.role === "superadmin" || profile?.role === "admin" || profile?.role === "school" ? "/admin" : "/user"} variant="text">
            Dashboard
          </Button>
        </div>
      </div>

      <section className="panel">
        <h3 className="panel-title">Scope</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            label="School ID"
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            size="small"
            disabled={profile?.role !== "superadmin" && Boolean(profile?.school_id)}
          />
          <TextField
            label="Record ID"
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
            size="small"
          />
          <Button variant="contained" onClick={listItems} disabled={busy || !schoolId}>Load List</Button>
        </div>
        {error ? <p className="error-text" style={{ marginTop: 8 }}>{error}</p> : null}
        {success ? <p style={{ marginTop: 8 }}>{success}</p> : null}
      </section>

      <section className="split-grid" style={{ marginTop: 16 }}>
        <article className="panel col-6">
          <h3 className="panel-title">Create</h3>
          {canWrite ? (
            <>
              <div style={{ display: "grid", gap: 10 }}>
                {moduleDef.fields.map((field) =>
                  renderField(
                    field,
                    createForm[field.name],
                    (name, value) => setCreateForm((prev) => ({ ...prev, [name]: value })),
                    createErrors
                  )
                )}
              </div>
              <div style={{ marginTop: 10 }}>
                <Button variant="contained" onClick={createItem} disabled={busy || !schoolId}>Create</Button>
              </div>
            </>
          ) : (
            <p className="panel-subtitle">Read-only access for your role.</p>
          )}
        </article>

        <article className="panel col-6">
          <h3 className="panel-title">Update</h3>
          {moduleDef.updatePath && canWrite ? (
            <>
              <div style={{ display: "grid", gap: 10 }}>
                {moduleDef.fields.map((field) =>
                  renderField(
                    field,
                    updateForm[field.name],
                    (name, value) => setUpdateForm((prev) => ({ ...prev, [name]: value })),
                    updateErrors
                  )
                )}
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <Button variant="contained" onClick={updateItem} disabled={busy || !recordId}>Update</Button>
                {moduleDef.deletePath ? (
                  <Button variant="outlined" color="error" onClick={deleteItem} disabled={busy || !recordId}>
                    Delete
                  </Button>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <p className="panel-subtitle">
                {canWrite ? "This module has no update endpoint." : "Read-only access for your role."}
              </p>
              {moduleDef.deletePath && canWrite ? (
                <Button variant="outlined" color="error" onClick={deleteItem} disabled={busy || !recordId}>
                  Delete by ID
                </Button>
              ) : null}
            </>
          )}
        </article>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h3 className="panel-title">Records ({items.length})</h3>
        <div className="list">
          {items.length === 0 ? <div className="list-item">No records loaded.</div> : null}
          {items.map((item) => (
            <div key={item.id || JSON.stringify(item)} className="list-item">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <strong>ID: {item.id ?? "n/a"}</strong>
                <Button size="small" variant="outlined" onClick={() => fillUpdate(item)}>
                  Edit
                </Button>
              </div>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(item, null, 2)}</pre>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
