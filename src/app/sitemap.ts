import { MetadataRoute } from "next";
import { fetchAllPosts } from "@/lib/rss";

const BASE_URL = "https://sonichigo.com";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, priority: 1.0, changeFrequency: "weekly" },
    { url: `${BASE_URL}/posts`, priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE_URL}/talks`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE_URL}/travels`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE_URL}/about`, priority: 0.8, changeFrequency: "monthly" },
  ];

  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await fetchAllPosts();
    postRoutes = posts.map((post) => ({
      url: post.url,
      lastModified: post.published_at ? new Date(post.published_at) : undefined,
      priority: 0.64,
      changeFrequency: "monthly" as const,
    }));
  } catch (err) {
    console.error("sitemap: failed to fetch posts", err);
  }

  return [...staticRoutes, ...postRoutes];
}
