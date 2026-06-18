let API_BASE_URL = "http://localhost:3000";
let onAuthFailure = null;
let onAccessTokenRefreshed = null;
let refreshPromise = null;

export function setApiBaseUrl(url) {
  API_BASE_URL = String(url || "").replace(/\/+$/, "");
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function setAuthFailureHandler(handler) {
  onAuthFailure = typeof handler === "function" ? handler : null;
}

export function setAccessTokenRefreshedHandler(handler) {
  onAccessTokenRefreshed = typeof handler === "function" ? handler : null;
}

async function performRequest(
  path,
  { method = "GET", body, token, credentials } = {},
) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    ...(credentials ? { credentials } : {}),
    body: body ? JSON.stringify(body) : undefined,
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

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = performRequest("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    }).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiRequest(path, options = {}, hasRetried = false) {
  const { token } = options;

  try {
    return await performRequest(path, options);
  } catch (error) {
    const shouldTryRefresh =
      !hasRetried &&
      Boolean(token) &&
      error?.status === 401 &&
      path !== "/api/auth/refresh";

    if (shouldTryRefresh) {
      try {
        const refreshed = await refreshAccessToken();
        const refreshedToken = refreshed?.accessToken;

        if (!refreshedToken) {
          throw new Error("Session expirée");
        }

        if (onAccessTokenRefreshed) {
          onAccessTokenRefreshed({
            accessToken: refreshedToken,
            user: refreshed?.user ?? null,
          });
        }

        return await apiRequest(
          path,
          { ...options, token: refreshedToken },
          true,
        );
      } catch (refreshError) {
        if (onAuthFailure) {
          onAuthFailure({
            status: 401,
            message: "Session expirée",
            path,
          });
        }
        throw refreshError;
      }
    }

    if (error?.status === 401 && token && onAuthFailure) {
      onAuthFailure({
        status: error.status,
        message: error.message,
        path,
      });
    }

    throw error;
  }
}
