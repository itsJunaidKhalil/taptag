import type { MetadataRoute } from "next";
import { createServerClient } from "@/lib/supabase-server";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://taptag.biz";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/auth/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("username, updated_at")
      .not("username", "is", null)
      .limit(5000);

    if (error || !data) return staticUrls;

    const profileUrls: MetadataRoute.Sitemap = data
      .filter((p) => !!p.username)
      .map((p) => ({
        url: `${SITE_URL}/${p.username}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    return [...staticUrls, ...profileUrls];
  } catch {
    return staticUrls;
  }
}
