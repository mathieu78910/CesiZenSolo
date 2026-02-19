import { apiRequest } from "./client.js";

export const listUsers = ({ page, limit, search, token }) => {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (search) params.set("search", search);
  const query = params.toString();
  return apiRequest(`/api/users${query ? `?${query}` : ""}`, { token });
};

export const createUser = ({ payload, token }) =>
  apiRequest("/api/users", { method: "POST", body: payload, token });

export const updateUser = ({ userId, payload, token }) =>
  apiRequest(`/api/users/${userId}`, { method: "PATCH", body: payload, token });

export const deleteUser = ({ userId, token }) =>
  apiRequest(`/api/users/${userId}`, { method: "DELETE", token });
