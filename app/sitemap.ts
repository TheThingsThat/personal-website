import type { MetadataRoute } from "next";
import { getAllItems } from "@/lib/content";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const items = getAllItems();
  const newest = items[0]?.date;

  return [
    {
      url: site.url,
      lastModified: newest ? new Date(`${newest}T00:00:00Z`) : undefined,
    },
    { url: `${site.url}/about` },
    ...items.map((item) => ({
      url: `${site.url}/${item.slug}`,
      lastModified: new Date(`${item.date}T00:00:00Z`),
    })),
  ];
}
