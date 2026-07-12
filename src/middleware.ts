import { NextRequest, NextResponse } from "next/server";

const EDITOR_PATHS = ["/editor", "/api/editor"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isEditorRoute = EDITOR_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (isEditorRoute) {
    const host = request.headers.get("host") ?? "";
    const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");

    if (!isLocal) {
      return new NextResponse(null, { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/editor/:path*", "/api/editor/:path*"],
};
