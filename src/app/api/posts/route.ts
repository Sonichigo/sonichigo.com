import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { fetchAllPosts } from "@/lib/rss";
import type { Post } from "@/lib/types";

export const revalidate = 3600; // Cache for 1 hour
export const dynamic = "force-static"; // Force static generation when possible

export async function GET() {
  try {
    // Fetch from both DB and RSS in parallel
    const [dbPosts, rssPosts] = await Promise.allSettled([
      fetchDbPosts(),
      fetchAllPosts(),
    ]);

    const db = dbPosts.status === "fulfilled" ? dbPosts.value : [];
    const rss = rssPosts.status === "fulfilled" ? rssPosts.value : [];

    // Merge: DB posts take priority, then RSS fills in
    const urlSet = new Set(db.map((p) => p.url));
    const merged = [...db, ...rss.filter((p) => !urlSet.has(p.url))];
    merged.sort((a, b) => (b.published_at > a.published_at ? 1 : -1));

    return NextResponse.json(merged, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("Posts API error:", error);
    // Fallback: try RSS only
    try {
      const rssPosts = await fetchAllPosts();
      return NextResponse.json(rssPosts, {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      });
    } catch {
      return NextResponse.json([], {
        status: 500,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      });
    }
  }
}

async function fetchDbPosts(): Promise<Post[]> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM posts ORDER BY published_at DESC`;
  // Normalize dates to YYYY-MM-DD format
  return rows.map((row: any) => ({
    ...row,
    published_at: row.published_at
      ? new Date(row.published_at).toISOString().split('T')[0]
      : null,
  })) as Post[];
}
