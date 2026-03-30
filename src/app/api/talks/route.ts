import { NextResponse } from "next/server";
import { parseTalksMarkdown } from "@/lib/markdown-parser";
import type { Talk } from "@/lib/types";

export const revalidate = 3600; // Cache for 1 hour
export const dynamic = "force-static"; // Force static generation when possible

export async function GET() {
  try {
    const talks = await parseTalksMarkdown();

    // Sort by date descending
    talks.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date > a.date ? 1 : -1;
    });

    return NextResponse.json(talks as Talk[], {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
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
