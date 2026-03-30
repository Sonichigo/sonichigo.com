import { NextResponse } from "next/server";
import { fetchAllPosts } from "@/lib/rss";

export const revalidate = 3600; // Cache for 1 hour
export const dynamic = "force-static"; // Force static generation when possible

export async function GET() {
  try {
    // Fetch from RSS feed
    const posts = await fetchAllPosts();

    // Sort by published date descending
    posts.sort((a, b) => (b.published_at > a.published_at ? 1 : -1));

    return NextResponse.json(posts, {
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
