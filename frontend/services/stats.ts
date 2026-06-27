import { apiRequest } from "./api-client";

export async function getStats() {
  const res = await apiRequest("/dashboard/stats");
  return res.data;
}
