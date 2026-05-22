import { apiRequest } from "./client.js";

export const login = (payload) =>
  apiRequest("/api/auth/login", { method: "POST", body: payload, credentials: "include" });

export const register = (payload) =>
  apiRequest("/api/auth/register", { method: "POST", body: payload, credentials: "include" });

export const forgotPassword = (payload) =>
  apiRequest("/api/auth/forgot-password", { method: "POST", body: payload });

export const refresh = () =>
  apiRequest("/api/auth/refresh", { method: "POST", credentials: "include" });

export const logout = () =>
  apiRequest("/api/auth/logout", { method: "POST", credentials: "include" });
