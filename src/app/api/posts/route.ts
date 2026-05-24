import "@/lib/init"; // Initialize app configuration
import { NextResponse } from "next/server";
import { fetchAllPosts } from "@/lib/rss";
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";

export const revalidate = 3600; // Cache for 1 hour
export const dynamic = "force-dynamic"; // Always fetch fresh data from external sources

async function getLocalPosts() {
  try {
    const POSTS_DIR = path.join(process.cwd(), "data", "posts");
    await fs.access(POSTS_DIR);
    const files = await fs.readdir(POSTS_DIR);
    const mdFiles = files.filter((f) => f.endsWith(".md"));

    const localPosts = await Promise.all(
      mdFiles.map(async (filename) => {
        const filePath = path.join(POSTS_DIR, filename);
        const fileContent = await fs.readFile(filePath, "utf-8");
        const { data } = matter(fileContent);

        const slug = filename.replace(".md", "");

        return {
          id: Math.floor(Math.random() * 1000000),
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

    return localPosts;
  } catch (error) {
    return [];
  }
}

export async function GET() {
  try {
    // Fetch from both RSS feed and local posts
    const [rssPosts, localPosts] = await Promise.all([
      fetchAllPosts(),
      getLocalPosts(),
    ]);

    // Combine posts
    const allPosts = [...rssPosts, ...localPosts];

    // Sort by published date descending
    allPosts.sort((a, b) => (b.published_at > a.published_at ? 1 : -1));

    return NextResponse.json(allPosts, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("Posts API error:", error);
    return NextResponse.json([], {
      status: 500,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  }
}
