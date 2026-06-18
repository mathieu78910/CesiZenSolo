// URL de base de l'API. Modifiable via setApiBaseUrl() au démarrage de l'app.
let API_BASE_URL = "http://localhost:3000";

// Callback appelé quand la session expire et ne peut plus être renouvelée.
// Utilisé par le frontend pour rediriger vers /login.
let onAuthFailure = null;

// Callback appelé quand un nouvel access token a été obtenu via le refresh token.
// Permet au frontend de mettre à jour le token en mémoire sans déconnecter l'utilisateur.
let onAccessTokenRefreshed = null;

// Promesse partagée pour le renouvellement du token.
// Évite d'envoyer plusieurs requêtes /refresh simultanées si plusieurs appels
// expirent en même temps (pattern "deduplication de requête").
let refreshPromise = null;

// Définit l'URL de base de l'API (sans slash final).
export function setApiBaseUrl(url) {
  API_BASE_URL = String(url || "").replace(/\/+$/, "");
}

// Retourne l'URL de base actuellement configurée.
export function getApiBaseUrl() {
  return API_BASE_URL;
}

// Enregistre le handler appelé en cas d'échec d'authentification non récupérable.
export function setAuthFailureHandler(handler) {
  onAuthFailure = typeof handler === "function" ? handler : null;
}

// Enregistre le handler appelé quand l'access token est renouvelé avec succès.
export function setAccessTokenRefreshedHandler(handler) {
  onAccessTokenRefreshed = typeof handler === "function" ? handler : null;
}

// Exécute une requête HTTP vers l'API.
// - Ajoute automatiquement Content-Type et Authorization si nécessaire.
// - Parse la réponse en JSON ou texte selon le Content-Type retourné.
// - Lance une erreur enrichie (status, data) si la réponse n'est pas ok (2xx).
async function performRequest(path, { method = "GET", body, token, credentials } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    // credentials: "include" est nécessaire pour envoyer le cookie HttpOnly
    // qui contient le refresh token (cross-origin en développement local).
    ...(credentials ? { credentials } : {}),
    body: body ? JSON.stringify(body) : undefined
  });

  const contentType = response.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) data = await response.json();
  else if (response.status !== 204) data = await response.text(); // 204 = No Content, pas de corps

  if (!response.ok) {
    // Erreur enrichie pour permettre aux appelants d'accéder au statut HTTP
    // et au corps de la réponse sans avoir à re-parser.
    const message = data?.error || data?.message || "Erreur API";
    const err = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

// Renouvelle l'access token en utilisant le refresh token stocké en cookie HttpOnly.
// La déduplication via refreshPromise garantit qu'une seule requête est envoyée
// même si plusieurs appels concurrents déclenchent un 401 au même moment.
async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = performRequest("/api/auth/refresh", {
      method: "POST",
      credentials: "include" // indispensable pour transmettre le cookie refresh token
    })
      .finally(() => {
        // Réinitialise la promesse après résolution ou rejet
        // pour permettre un futur refresh si nécessaire.
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

// Point d'entrée public pour tous les appels API du frontend.
// Gère automatiquement le renouvellement du token (retry transparent) :
//   1. Tente la requête avec l'access token courant.
//   2. Si 401 → tente un refresh via le cookie HttpOnly.
//   3. Si le refresh réussit → relance la requête avec le nouveau token.
//   4. Si le refresh échoue → notifie onAuthFailure (ex: redirection /login).
export async function apiRequest(path, options = {}, hasRetried = false) {
  const { token } = options;

  try {
    return await performRequest(path, options);
  } catch (error) {
    // On tente le refresh uniquement si :
    // - c'est bien un 401 (token expiré, pas un 403 interdit)
    // - on avait un token (sinon pas de session à renouveler)
    // - on n'a pas déjà retryé (évite une boucle infinie)
    // - ce n'est pas la route de refresh elle-même (évite la récursion)
    const shouldTryRefresh = !hasRetried && Boolean(token) && error?.status === 401 && path !== "/api/auth/refresh";

    if (shouldTryRefresh) {
      try {
        const refreshed = await refreshAccessToken();
        const refreshedToken = refreshed?.accessToken;

        if (!refreshedToken) {
          throw new Error("Session expirée");
        }

        // Notifie le frontend du nouveau token pour qu'il mette à jour son état
        // (ex: localStorage, contexte React) sans déconnecter l'utilisateur.
        if (onAccessTokenRefreshed) {
          onAccessTokenRefreshed({
            accessToken: refreshedToken,
            user: refreshed?.user ?? null
          });
        }

        // Relance la requête initiale avec le nouveau token (hasRetried = true
        // pour ne pas boucler si ce second appel retourne aussi un 401).
        return await apiRequest(path, { ...options, token: refreshedToken }, true);
      } catch (refreshError) {
        // Le refresh a échoué (cookie expiré, révoqué, serveur KO…) :
        // la session n'est plus récupérable → on notifie le frontend.
        if (onAuthFailure) {
          onAuthFailure({
            status: 401,
            message: "Session expirée",
            path
          });
        }
        throw refreshError;
      }
    }

    // 401 sans possibilité de refresh (pas de token, déjà retryé, route /refresh) :
    // on notifie quand même onAuthFailure si un handler est enregistré.
    if (error?.status === 401 && token && onAuthFailure) {
      onAuthFailure({
        status: error.status,
        message: error.message,
        path
      });
    }

    throw error;
  }
}
