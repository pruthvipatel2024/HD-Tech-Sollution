import GalleryClient from "./gallery-client";
import { getGallery } from "@/services/gallery";

export const revalidate = 0;

export default async function GalleryPage() {
  let items = [];

  try {
    items = await getGallery();
  } catch (e) {
    console.error("Failed to load gallery items on server render:", e);
  }

  return <GalleryClient initialItems={items} />;
}
