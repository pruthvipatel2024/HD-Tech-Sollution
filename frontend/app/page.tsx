import HomeClient from "./home-client";
import { getCmsSettings, getBrands, getTestimonials, getServices } from "@/services/cms";
import { getGallery } from "@/services/gallery";

// Turn off caching for real-time updates from admin CMS alterations
export const revalidate = 0;

export default async function Home() {
  let cms = {};
  let galleryItems = [];
  let testimonials = [];
  let brands = [];
  let services = [];

  try {
    cms = await getCmsSettings();
  } catch (e) {
    console.error("Failed to load CMS settings on server render:", e);
  }

  try {
    galleryItems = await getGallery();
  } catch (e) {
    console.error("Failed to load gallery items on server render:", e);
  }

  try {
    testimonials = await getTestimonials();
  } catch (e) {
    console.error("Failed to load testimonials on server render:", e);
  }

  try {
    brands = await getBrands();
  } catch (e) {
    console.error("Failed to load brands on server render:", e);
  }

  try {
    services = await getServices();
  } catch (e) {
    console.error("Failed to load services on server render:", e);
  }

  return (
    <HomeClient
      cms={cms}
      galleryItems={galleryItems}
      testimonials={testimonials}
      brands={brands}
      services={services}
    />
  );
}
