import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://velocityos.app",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://velocityos.app/workspace",
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
}
