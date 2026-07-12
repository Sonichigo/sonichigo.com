import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    const EDITOR_PASSWORD = process.env.EDITOR_PASSWORD;
    if (!EDITOR_PASSWORD) {
      return NextResponse.json({ error: "Editor not configured" }, { status: 503 });
    }

    if (password === EDITOR_PASSWORD) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
