export type CredentialsMode = "omit" | "same-origin" | "include";

export interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
  credentials?: CredentialsMode;
}

export function setApiBaseUrl(url: string): void;
export function getApiBaseUrl(): string;
export function setAuthFailureHandler(handler: ((payload: { status: number; message: string; path: string }) => void) | null): void;
export function apiRequest(path: string, options?: ApiRequestOptions): Promise<any>;

export interface AuthPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface ForgotPasswordPayload {
  email: string;
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

export interface UserSelfParams {
  token?: string;
}

export interface ResourcesListParams {
  page?: number;
  limit?: number;
  search?: string;
  resourceType?: string;
  token?: string;
}

export interface ResourceMutationParams {
  payload: Record<string, unknown>;
  token?: string;
}

export interface ResourceByIdParams {
  resourceId: number | string;
  token?: string;
}

export interface ResourceToggleParams {
  resourceId: number | string;
  token?: string;
}

export interface ResourceUpdateParams extends ResourceMutationParams {
  resourceId: number | string;
}

export interface ExerciseListParams {
  token?: string;
}

export interface ExercisePracticeParams {
  exerciseId: number | string;
  payload: Record<string, unknown>;
  token?: string;
}

export namespace auth {
  function login(payload: AuthPayload): Promise<any>;
  function register(payload: AuthPayload): Promise<any>;
  function forgotPassword(payload: ForgotPasswordPayload): Promise<any>;
  function logout(): Promise<any>;
}

export namespace exercises {
  function listExercises(params: ExerciseListParams): Promise<any>;
  function createPractice(params: ExercisePracticeParams): Promise<any>;
}

export namespace resources {
  function listResources(params: ResourcesListParams): Promise<any>;
  function getResourceById(params: ResourceByIdParams): Promise<any>;
  function listPublicResources(params: Omit<ResourcesListParams, "token">): Promise<any>;
  function getPublicResourceById(params: Omit<ResourceByIdParams, "token">): Promise<any>;
  function listAppResources(params: ResourcesListParams): Promise<any>;
  function toggleResourceLike(params: ResourceToggleParams): Promise<any>;
  function toggleResourceSave(params: ResourceToggleParams): Promise<any>;
  function createResource(params: ResourceMutationParams): Promise<any>;
  function updateResource(params: ResourceUpdateParams): Promise<any>;
  function deleteResource(params: ResourceByIdParams): Promise<any>;
}

export namespace users {
  function listUsers(params: UsersListParams): Promise<any>;
  function getMe(params: UserSelfParams): Promise<any>;
  function getMyLibrary(params: UserSelfParams): Promise<any>;
  function updateMe(params: UserMutationParams): Promise<any>;
  function createUser(params: UserMutationParams): Promise<any>;
  function updateUser(params: UserUpdateParams): Promise<any>;
  function deleteUser(params: UserDeleteParams): Promise<any>;
}
