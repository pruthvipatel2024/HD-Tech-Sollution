import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hdtechsolutions.vercel.app";
  const apiCacheUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
  ];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout max
    
    const res = await fetch(`${apiCacheUrl}/products`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error("API responded with error");
    
    const productsRes = await res.json();
    const dynamicProductUrls = (productsRes.data || []).map((p: any) => ({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: new Date(p.updatedAt || p.createdAt || Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...staticUrls, ...dynamicProductUrls];
  } catch (err) {
    console.error("Failed to compile dynamic sitemap urls (offline/timeout):", err);
    return staticUrls;
  }
}
