import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Simple password check - in production, use proper authentication
    // You can set this via environment variable
    const EDITOR_PASSWORD = process.env.EDITOR_PASSWORD || "admin123";

    if (password === EDITOR_PASSWORD) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
