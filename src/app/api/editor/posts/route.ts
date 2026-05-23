import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "data", "posts");

// Ensure posts directory exists
async function ensurePostsDir() {
  try {
    await fs.access(POSTS_DIR);
  } catch {
    await fs.mkdir(POSTS_DIR, { recursive: true });
  }
}

// Get all posts
export async function GET() {
  try {
    await ensurePostsDir();
    const files = await fs.readdir(POSTS_DIR);
    const mdFiles = files.filter((f) => f.endsWith(".md"));

    const posts = await Promise.all(
      mdFiles.map(async (filename) => {
        const filePath = path.join(POSTS_DIR, filename);
        const fileContent = await fs.readFile(filePath, "utf-8");
        const { data } = matter(fileContent);

        return {
          slug: filename.replace(".md", ""),
          title: data.title || "Untitled",
          date: data.date || new Date().toISOString().split("T")[0],
          excerpt: data.excerpt || "",
          tags: data.tags || [],
        };
      })
    );

    // Sort by date, newest first
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error reading posts:", error);
    return NextResponse.json([]);
  }
}

// Create new post
export async function POST(request: NextRequest) {
  try {
    await ensurePostsDir();
    const { title, date, excerpt, tags, content } = await request.json();

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const frontmatter = {
      title,
      date,
      excerpt,
      tags,
    };

    const fileContent = matter.stringify(content, frontmatter);
    const filePath = path.join(POSTS_DIR, `${slug}.md`);

    await fs.writeFile(filePath, fileContent, "utf-8");

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
