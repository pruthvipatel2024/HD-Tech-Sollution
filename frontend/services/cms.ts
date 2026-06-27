import { apiRequest } from "./api-client";

export async function getCmsSettings() {
  const res = await apiRequest("/cms");
  return res.data;
}

export async function updateCmsSetting(key: string, value: string) {
  const res = await apiRequest("/cms", {
    method: "PUT",
    body: JSON.stringify({ key, value }),
  });
  return res.data;
}

export async function getServices() {
  const res = await apiRequest("/services");
  return res.data;
}

export async function getBrands() {
  const res = await apiRequest("/brands");
  return res.data;
}

export async function getTestimonials() {
  const res = await apiRequest("/testimonials");
  return res.data;
}
