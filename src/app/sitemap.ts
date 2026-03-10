import { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/articles";
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://officechairpicks.vercel.app";
  const slugs = getAllSlugs();
  return [
    ...["", "about", "contact", "privacy", "affiliate-disclosure"].map((p) => ({
      url: `${baseUrl}/${p}`, lastModified: new Date("2026-03-11"), changeFrequency: "monthly" as const, priority: p === "" ? 1.0 : 0.5,
    })),
    ...slugs.map((slug) => ({
      url: `${baseUrl}/${slug}`, lastModified: new Date("2026-03-11"), changeFrequency: "weekly" as const, priority: 0.8,
    })),
  ];
}
