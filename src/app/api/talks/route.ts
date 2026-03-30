import { NextResponse } from "next/server";
import { getDb } from "@/db";
import type { Talk } from "@/lib/types";

export const revalidate = 3600; // Cache for 1 hour
export const dynamic = "force-static"; // Force static generation when possible

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM talks ORDER BY date DESC`;
    // Normalize dates to YYYY-MM-DD format
    const talks = rows.map((row: any) => ({
      ...row,
      date: row.date ? new Date(row.date).toISOString().split('T')[0] : null,
    }));
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
