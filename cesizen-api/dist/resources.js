import { apiRequest } from "./client.js";

export const listResources = ({ page, limit, search, resourceType, token }) => {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (search) params.set("search", search);
  if (resourceType) params.set("resourceType", resourceType);

  const query = params.toString();
  return apiRequest(`/api/resources${query ? `?${query}` : ""}`, { token });
};

export const getResourceById = ({ resourceId, token }) =>
  apiRequest(`/api/resources/${resourceId}`, { token });

export const listPublicResources = ({ page, limit, search, resourceType }) => {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (search) params.set("search", search);
  if (resourceType) params.set("resourceType", resourceType);

  const query = params.toString();
  return apiRequest(`/api/resources/public${query ? `?${query}` : ""}`);
};

export const getPublicResourceById = ({ resourceId }) =>
  apiRequest(`/api/resources/public/${resourceId}`);

export const listAppResources = ({ page, limit, search, resourceType, token }) => {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (search) params.set("search", search);
  if (resourceType) params.set("resourceType", resourceType);

  const query = params.toString();
  return apiRequest(`/api/resources/feed${query ? `?${query}` : ""}`, { token });
};

export const toggleResourceLike = ({ resourceId, token }) =>
  apiRequest(`/api/resources/${resourceId}/likes/toggle`, { method: "POST", token });

export const toggleResourceSave = ({ resourceId, token }) =>
  apiRequest(`/api/resources/${resourceId}/saves/toggle`, { method: "POST", token });

export const createResource = ({ payload, token }) =>
  apiRequest("/api/resources", { method: "POST", body: payload, token });

export const updateResource = ({ resourceId, payload, token }) =>
  apiRequest(`/api/resources/${resourceId}`, { method: "PATCH", body: payload, token });

export const deleteResource = ({ resourceId, token }) =>
  apiRequest(`/api/resources/${resourceId}`, { method: "DELETE", token });
