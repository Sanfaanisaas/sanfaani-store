import axiosInstance from "./axiosInstance";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function registerRequest(payload: RegisterPayload) {
  const res = await axiosInstance.post("/auth/register", payload);
  return res.data.data;
}

export async function loginRequest(payload: LoginPayload) {
  const res = await axiosInstance.post("/auth/login", payload);
  return res.data.data; // { accessToken, user }
}

export async function refreshRequest() {
  const res = await axiosInstance.post("/auth/refresh");
  return res.data.data; // { accessToken, user }
}

export async function logoutRequest() {
  const res = await axiosInstance.post("/auth/logout");
  return res.data.data;
}