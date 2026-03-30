import { NextResponse } from "next/server";
import { fetchAllPosts } from "@/lib/rss";

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const posts = await fetchAllPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching RSS posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
