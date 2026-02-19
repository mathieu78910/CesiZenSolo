const AUTH_STORAGE_KEY = "cz_admin_auth";

export const saveAuth = (payload) => {
  if (!payload) return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
};

export const loadAuth = () => {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const clearAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const getAccessToken = () => {
  const auth = loadAuth();
  return auth?.accessToken ?? null;
};

export const getAuthUser = () => {
  const auth = loadAuth();
  return auth?.user ?? null;
};
