import { apiRequest } from "./api-client";

export async function login(username: string, password: string) {
  const res = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  if (res.token && typeof document !== "undefined") {
    document.cookie = `token=${res.token}; path=/; max-age=${15 * 60}; SameSite=Lax; Secure`;
  }
  if (res.refreshToken && typeof document !== "undefined") {
    document.cookie = `refreshToken=${res.refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax; Secure`;
  }

  return res.data;
}

export async function logout() {
  if (typeof document !== "undefined") {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
  return await apiRequest("/auth/logout", { method: "POST" });
}

export async function checkSession() {
  const res = await apiRequest("/auth/me");
  return res.data;
}
