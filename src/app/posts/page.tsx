import "@/lib/init";
import { fetchAllPosts } from "@/lib/rss";
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import PostsClient from "./PostsClient";

export const revalidate = 3600;

async function getLocalPosts() {
  try {
    const POSTS_DIR = path.join(process.cwd(), "data", "posts");
    await fs.access(POSTS_DIR);
    const files = await fs.readdir(POSTS_DIR);
    const mdFiles = files.filter((f) => f.endsWith(".md"));

    return await Promise.all(
      mdFiles.map(async (filename) => {
        const filePath = path.join(POSTS_DIR, filename);
        const fileContent = await fs.readFile(filePath, "utf-8");
        const { data } = matter(fileContent);
        const slug = filename.replace(".md", "");
        return {
          id: 0,
          title: data.title || "Untitled",
          url: `/posts/${slug}`,
          source: "sonichigo.com",
          published_at: data.date || new Date().toISOString().split("T")[0],
          excerpt: data.excerpt || "",
          tags: data.tags || [],
          image_url: data.image_url || null,
          is_featured: data.is_featured || false,
        };
      })
    );
  } catch {
    return [];
  }
}

export default async function PostsPage() {
  const [rssPosts, localPosts] = await Promise.all([
    fetchAllPosts(),
    getLocalPosts(),
  ]);

  const posts = [...rssPosts, ...localPosts].sort((a, b) =>
    b.published_at > a.published_at ? 1 : -1
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="page-title">Writing</h1>
      <p className="page-subtitle">
        Thoughts, tutorials, and deep-dives into DevOps, cloud-native, testing,
        and developer experience.
      </p>
      <PostsClient posts={posts} />
    </div>
  );
}
