import { MetadataRoute } from "next";
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";

const BASE_URL = "https://sonichigo.com";
const POSTS_DIR = path.join(process.cwd(), "data", "posts");

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
    const files = await fs.readdir(POSTS_DIR);
    postRoutes = await Promise.all(
      files
        .filter((f) => f.endsWith(".md"))
        .map(async (file) => {
          const slug = file.replace(/\.md$/, "");
          const content = await fs.readFile(path.join(POSTS_DIR, file), "utf-8");
          const { data } = matter(content);
          return {
            url: `${BASE_URL}/posts/${slug}`,
            lastModified: data.date ? new Date(data.date) : undefined,
            priority: 0.64 as const,
            changeFrequency: "monthly" as const,
          };
        })
    );
  } catch (err) {
    console.error("sitemap: failed to read posts", err);
  }

  return [...staticRoutes, ...postRoutes];
}
