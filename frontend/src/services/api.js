function trimSlash(value) {
  return value ? value.replace(/\/+$/, "") : value;
}

export function getApiBaseUrl() {
  const envBase = trimSlash(import.meta.env.VITE_API_BASE_URL);
  if (envBase) return envBase;

  if (typeof window !== "undefined") {
    const protocol = window.location.protocol;
    if (protocol === "http:" || protocol === "https:") {
      return "/api";
    }
  }

  return "http://127.0.0.1:8000/api";
}

export async function apiFetch(path, options = {}) {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return fetch(`${base}${normalizedPath}`, options);
}

export async function readResponseData(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export function getAuthHeaders(token, includeContentType = true) {
  const headers = {};
  if (includeContentType) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export function schoolPath(template, schoolId) {
  return template.replace("{school_id}", String(schoolId));
}

export function interpolatePath(template, params = {}) {
  return Object.keys(params).reduce((acc, key) => {
    return acc.replace(`{${key}}`, String(params[key]));
  }, template);
}
