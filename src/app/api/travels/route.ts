import { NextResponse } from "next/server";
import { getDb } from "@/db";
import type { Travel } from "@/lib/types";

export const revalidate = process.env.NODE_ENV === 'development' ? 0 : 3600; // No cache in dev, 1 hour in prod
export const dynamic = process.env.NODE_ENV === 'development' ? 'force-dynamic' : 'force-static';

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM travels ORDER BY visited_date DESC NULLS LAST`;
    const cacheControl = process.env.NODE_ENV === 'development'
      ? 'no-store, must-revalidate'
      : 'public, s-maxage=3600, stale-while-revalidate=7200';
    return NextResponse.json(rows as Travel[], {
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
