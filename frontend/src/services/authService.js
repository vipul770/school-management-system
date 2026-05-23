import { apiFetch, getAuthHeaders, readResponseData } from "./api";
import { clearSession, setProfile, setToken } from "../utils/tokenManager";

export async function login(credentials) {
  const response = await apiFetch("/auth/login", {
    method: "POST",
    headers: getAuthHeaders(null),
    body: JSON.stringify(credentials),
  });

  const data = await readResponseData(response);
  if (!response.ok) {
    throw new Error(data?.detail || "Login failed");
  }

  if (data?.access_token) {
    setToken(data.access_token);
  }
  if (data?.profile) {
    setProfile(data.profile);
  }

  return data;
}

export function logout() {
  clearSession();
}

export async function refreshToken() {
  return null;
}
