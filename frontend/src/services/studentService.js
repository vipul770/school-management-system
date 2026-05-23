import { apiFetch, getAuthHeaders, readResponseData } from "./api";

export async function fetchStudents(schoolId, token) {
  const response = await apiFetch(`/schools/${schoolId}/students`, {
    headers: getAuthHeaders(token),
  });
  const data = await readResponseData(response);
  if (!response.ok) {
    throw new Error(data?.detail || "Unable to fetch students");
  }
  return Array.isArray(data) ? data : [];
}
