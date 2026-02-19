export type CredentialsMode = "omit" | "same-origin" | "include";

export interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
  credentials?: CredentialsMode;
}

export function setApiBaseUrl(url: string): void;
export function getApiBaseUrl(): string;
export function apiRequest(path: string, options?: ApiRequestOptions): Promise<any>;

export interface AuthPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface UsersListParams {
  page?: number;
  limit?: number;
  search?: string;
  token?: string;
}

export interface UserMutationParams {
  payload: Record<string, unknown>;
  token?: string;
}

export interface UserUpdateParams extends UserMutationParams {
  userId: number | string;
}

export interface UserDeleteParams {
  userId: number | string;
  token?: string;
}

export namespace auth {
  function login(payload: AuthPayload): Promise<any>;
  function register(payload: AuthPayload): Promise<any>;
  function logout(): Promise<any>;
}

export namespace users {
  function listUsers(params: UsersListParams): Promise<any>;
  function createUser(params: UserMutationParams): Promise<any>;
  function updateUser(params: UserUpdateParams): Promise<any>;
  function deleteUser(params: UserDeleteParams): Promise<any>;
}
