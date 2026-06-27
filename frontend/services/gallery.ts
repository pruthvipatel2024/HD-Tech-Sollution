import { apiRequest } from "./api-client";

export async function getGallery() {
  const res = await apiRequest("/gallery");
  return res.data;
}

export async function createGalleryItem(data: {
  title: string;
  description: string;
  location: string;
  serviceId: string;
  imageUrls: string[];
  beforeImageUrl?: string;
  afterImageUrl?: string;
  featured?: boolean;
  order?: number;
}) {
  const res = await apiRequest("/gallery", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteGalleryItem(id: string) {
  const res = await apiRequest(`/gallery/${id}`, { method: "DELETE" });
  return res.data;
}
