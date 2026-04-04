import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname, search } = req.nextUrl;

  const returnUrl = encodeURIComponent(pathname + search);

  // Protect Employer routes
  if (pathname.startsWith("/employer")) {
    if (!token || token.role !== "employer") {
      return NextResponse.redirect(new URL(`/login?returnUrl=${returnUrl}`, req.url));
    }
  }

  // Protect Employee routes
  if (pathname.startsWith("/employee")) {
    if (!token || token.role !== "employee") {
      return NextResponse.redirect(new URL(`/login?returnUrl=${returnUrl}`, req.url));
    }
  }

  // Fallthrough to standard handler
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/employer",
    "/employer/:path*",
    "/employee",
    "/employee/:path*",
  ],
};
