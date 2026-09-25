import { NextResponse } from "next/server";
import { parseTalksMarkdown } from "@/lib/markdown-parser";
import type { Talk } from "@/lib/types";

export const revalidate = process.env.NODE_ENV === 'development' ? 0 : 3600; // No cache in dev, 1 hour in prod
export const dynamic = process.env.NODE_ENV === 'development' ? 'force-dynamic' : 'force-static';

export async function GET() {
  try {
    const talks = await parseTalksMarkdown();

    // Sort by date descending
    talks.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date > a.date ? 1 : -1;
    });

    const cacheControl = process.env.NODE_ENV === 'development'
      ? 'no-store, must-revalidate'
      : 'public, s-maxage=3600, stale-while-revalidate=7200';

    return NextResponse.json(talks as Talk[], {
      headers: {
        "Cache-Control": cacheControl,
      },
    });
  } catch (error) {
    console.error("Talks API error:", error);
    return NextResponse.json([], {
      status: 500,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  }
}
