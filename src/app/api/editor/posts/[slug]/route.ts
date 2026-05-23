import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "data", "posts");

// Get single post
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const filePath = path.join(POSTS_DIR, `${params.slug}.md`);
    const fileContent = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    return NextResponse.json({
      slug: params.slug,
      title: data.title || "Untitled",
      date: data.date || new Date().toISOString().split("T")[0],
      excerpt: data.excerpt || "",
      tags: data.tags || [],
      content,
    });
  } catch (error) {
    console.error("Error reading post:", error);
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
}

// Update post
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { title, date, excerpt, tags, content } = await request.json();

    const frontmatter = {
      title,
      date,
      excerpt,
      tags,
    };

    const fileContent = matter.stringify(content, frontmatter);
    const filePath = path.join(POSTS_DIR, `${params.slug}.md`);

    await fs.writeFile(filePath, fileContent, "utf-8");

    return NextResponse.json({ success: true, slug: params.slug });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

// Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const filePath = path.join(POSTS_DIR, `${params.slug}.md`);
    await fs.unlink(filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
