let API_BASE_URL = "http://localhost:3000";

export function setApiBaseUrl(url) {
  API_BASE_URL = String(url || "").replace(/\/+$/, "");
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export async function apiRequest(path, { method = "GET", body, token, credentials } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    ...(credentials ? { credentials } : {}),
    body: body ? JSON.stringify(body) : undefined
  });

  const contentType = response.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) data = await response.json();
  else if (response.status !== 204) data = await response.text();

  if (!response.ok) {
    const message = data?.error || data?.message || "Erreur API";
    const err = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}