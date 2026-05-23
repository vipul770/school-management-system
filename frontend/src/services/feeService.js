import { apiFetch, getAuthHeaders, readResponseData } from "./api";

export async function fetchFeeInvoices(schoolId, token) {
  const response = await apiFetch(`/schools/${schoolId}/fees/invoices`, {
    headers: getAuthHeaders(token),
  });
  const data = await readResponseData(response);
  if (!response.ok) {
    throw new Error(data?.detail || "Unable to fetch fee invoices");
  }
  return Array.isArray(data) ? data : [];
}
