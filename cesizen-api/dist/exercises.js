import { apiRequest } from "./client.js";

export const listExercises = ({ token } = {}) =>
  apiRequest("/api/exercises", { token });

export const createPractice = ({ exerciseId, payload, token }) =>
  apiRequest(`/api/exercises/${exerciseId}/practices`, {
    method: "POST",
    body: payload,
    token
  });
