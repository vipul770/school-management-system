import {
  ORG_CONTEXT_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
} from "./constants";

export function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
}

export function setToken(token) {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
}

export function clearToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function getProfile() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

export function setProfile(profile) {
  if (typeof window !== "undefined") {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }
}

export function clearProfile() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  }
}

export function getOrganisationContext() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(ORG_CONTEXT_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

export function setOrganisationContext(context) {
  if (typeof window !== "undefined") {
    localStorage.setItem(ORG_CONTEXT_STORAGE_KEY, JSON.stringify(context));
  }
}

export function clearSession() {
  clearToken();
  clearProfile();
  if (typeof window !== "undefined") {
    localStorage.removeItem(ORG_CONTEXT_STORAGE_KEY);
  }
}
