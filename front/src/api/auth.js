import { apiRequest } from "./client.js";

export const login = (payload) => apiRequest("/api/auth/login", { method: "POST", body: payload });

export const register = (payload) => apiRequest("/api/auth/register", { method: "POST", body: payload });

export const logout = () => apiRequest("/api/auth/logout", { method: "POST" });
