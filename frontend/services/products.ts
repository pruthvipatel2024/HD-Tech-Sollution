import { apiRequest } from "./api-client";

export async function getCategories() {
  const res = await apiRequest("/categories");
  return res.data;
}

export async function getProducts(categoryId?: string, search?: string, sort?: string) {
  let query = "";
  const params: string[] = [];
  if (categoryId && categoryId !== "all") {
    params.push(`categoryId=${categoryId}`);
  }
  if (search) {
    params.push(`search=${encodeURIComponent(search)}`);
  }
  if (sort) {
    params.push(`sort=${sort}`);
  }
  if (params.length > 0) {
    query = `?${params.join("&")}`;
  }

  const res = await apiRequest(`/products${query}`);
  return res.data;
}

export async function createProduct(data: {
  name: string;
  slug?: string;
  description: string;
  price?: number | null;
  availability: boolean;
  categoryId: string;
  imageUrls: string[];
  sku?: string;
  modelNumber?: string;
  specifications?: string;
  warranty?: string;
  featured?: boolean;
  showPrice?: boolean;
  contactForPrice?: boolean;
  brandId?: string | null;
}) {
  const res = await apiRequest("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateProduct(
  id: string,
  data: {
    name: string;
    slug?: string;
    description: string;
    price?: number | null;
    availability: boolean;
    categoryId: string;
    imageUrls: string[];
    sku?: string;
    modelNumber?: string;
    specifications?: string;
    warranty?: string;
    featured?: boolean;
    showPrice?: boolean;
    contactForPrice?: boolean;
    brandId?: string | null;
  }
) {
  const res = await apiRequest(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteProduct(id: string) {
  const res = await apiRequest(`/products/${id}`, {
    method: "DELETE",
  });
  return res.data;
}
