import ProductsClient from "./products-client";
import { getCategories, getProducts } from "@/services/products";

export const revalidate = 0;

export default async function ProductsPage() {
  let categories = [];
  let products = [];

  try {
    categories = await getCategories();
  } catch (e) {
    console.error("Failed to load categories on server render:", e);
  }

  try {
    products = await getProducts();
  } catch (e) {
    console.error("Failed to load products on server render:", e);
  }

  return (
    <ProductsClient
      categories={categories}
      initialProducts={products}
    />
  );
}
