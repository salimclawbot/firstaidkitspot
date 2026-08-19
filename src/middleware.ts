import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/first-aid-kit-checklist-2026";
  return NextResponse.redirect(url, 308);
}

export const config = { matcher: "/what-every-first-aid-kit-should-contain" };
