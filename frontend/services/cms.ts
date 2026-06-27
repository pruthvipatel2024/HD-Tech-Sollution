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

export async function createBrand(name: string, logoUrl: string) {
  const res = await apiRequest("/brands", {
    method: "POST",
    body: JSON.stringify({ name, logoUrl }),
  });
  return res.data;
}

export async function deleteBrand(id: string) {
  const res = await apiRequest(`/brands/${id}`, {
    method: "DELETE",
  });
  return res.data;
}

export async function createTestimonial(data: {
  customerName: string;
  city?: string;
  content: string;
  rating: number;
  avatarUrl?: string;
  verified?: boolean;
  serviceUsed?: string;
}) {
  const res = await apiRequest("/testimonials", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteTestimonial(id: string) {
  const res = await apiRequest(`/testimonials/${id}`, {
    method: "DELETE",
  });
  return res.data;
}

export async function createService(data: {
  name: string;
  icon: string;
  description: string;
  bannerUrl?: string;
  displayOrder?: number;
  featured?: boolean;
  active?: boolean;
  buttonText?: string;
  buttonLink?: string;
}) {
  const res = await apiRequest("/services", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteService(id: string) {
  const res = await apiRequest(`/services/${id}`, {
    method: "DELETE",
  });
  return res.data;
}
