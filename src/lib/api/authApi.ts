import { apiClient } from "./client";
import type { AccountSessionRecord, AuthSession } from "./contracts";
export interface RegisterPayload { name: string; email: string; password: string; phone?: string; }
export interface LoginPayload { email: string; password: string; }
export const registerRequest = (payload: RegisterPayload) => apiClient.post<{ id: string }>("/auth/register", { body: payload, skipRefresh: true });
export const loginRequest = (payload: LoginPayload) => apiClient.post<AuthSession>("/auth/login", { body: payload, skipRefresh: true });
export const refreshRequest = () => apiClient.post<AuthSession>("/auth/refresh", { skipRefresh: true });
export const logoutRequest = () => apiClient.post<unknown>("/auth/logout", { skipRefresh: true });
export const listSessions = () => apiClient.get<AccountSessionRecord[]>("/auth/sessions");
export const revokeSession = (sessionId: string) => apiClient.delete<unknown>("/auth/sessions/" + encodeURIComponent(sessionId));
export const revokeAllSessions = () => apiClient.delete<unknown>("/auth/sessions");
