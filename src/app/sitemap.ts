import { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/articles";
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://firstaidkitspot.com";
  const slugs = getAllSlugs();
  return [
    ...["", "about", "contact", "privacy", "affiliate-disclosure"].map((p) => ({
      url: `${baseUrl}/${p}`, lastModified: "2026-03-23", changeFrequency: "monthly" as const, priority: p === "" ? 1.0 : 0.5,
    })),
    ...slugs.map((slug) => ({
      url: `${baseUrl}/${slug}`, lastModified: "2026-03-23", changeFrequency: "weekly" as const, priority: 0.8,
    })),
  ];
}
