import { apiRequest } from "./api-client";

export async function login(username: string, password: string) {
  const res = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  return res.data;
}

export async function logout() {
  return await apiRequest("/auth/logout", { method: "POST" });
}

export async function checkSession() {
  const res = await apiRequest("/auth/me");
  return res.data;
}
