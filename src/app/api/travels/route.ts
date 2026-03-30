import { NextResponse } from "next/server";
import { parseTravelsMarkdown } from "@/lib/markdown-parser";
import type { Travel } from "@/lib/types";

export const revalidate = process.env.NODE_ENV === 'development' ? 0 : 3600; // No cache in dev, 1 hour in prod
export const dynamic = process.env.NODE_ENV === 'development' ? 'force-dynamic' : 'force-static';

export async function GET() {
  try {
    const travels = await parseTravelsMarkdown();

    // Sort by visited_date descending (nulls last)
    travels.sort((a, b) => {
      if (!a.visited_date) return 1;
      if (!b.visited_date) return -1;
      return b.visited_date > a.visited_date ? 1 : -1;
    });

    const cacheControl = process.env.NODE_ENV === 'development'
      ? 'no-store, must-revalidate'
      : 'public, s-maxage=3600, stale-while-revalidate=7200';

    return NextResponse.json(travels as Travel[], {
      headers: {
        "Cache-Control": cacheControl,
      },
    });
  } catch (error) {
    console.error("Travels API error:", error);
    return NextResponse.json([], {
      status: 500,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  }
}
