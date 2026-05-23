import { apiFetch, getAuthHeaders, readResponseData } from "./api";

export async function fetchAttendance(schoolId, token) {
  const response = await apiFetch(`/schools/${schoolId}/attendance`, {
    headers: getAuthHeaders(token),
  });
  const data = await readResponseData(response);
  if (!response.ok) {
    throw new Error(data?.detail || "Unable to fetch attendance");
  }
  return Array.isArray(data) ? data : [];
}
