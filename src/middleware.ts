import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { ROUTES } from "./constants/routes";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;


    // =========== cookies section start ==========
    const ref = request.nextUrl.searchParams.get("ref");
    if (ref) {
        const res = NextResponse.next();
        res.cookies.set("gaza_arabia_affiliate_ref", ref, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
        });
    }
    // =========== cookies section end ==========


    // Get token from the request
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    });

    // Extract role
    const role = token?.role;

    // Protected route groups (excluding login)
    const isAdminRoute =
        pathname.startsWith("/admin") && pathname !== "/admin/login";
    const isAffiliateRoute =
        pathname.startsWith("/affiliate") && pathname !== "/affiliate/login" && pathname !== "/affiliate/register";

    // ================= ADMIN ROUTES ====================
    if (isAdminRoute) {
        // Not logged in
        if (!token) {
            return NextResponse.redirect(new URL(ROUTES.ADMIN.LOGIN, request.url));
        }

        // ----- ADMIN FULL ACCESS -----
        if (role === "admin") {
            // admin allowed everywhere under /admin
            return NextResponse.next();
        }

        // ----- CONTENT MANAGER ACCESS ONLY TO BLOGS -----
        if (role === "content_manager") {
            const isBlogsRoute = pathname.startsWith("/admin/blogs") || pathname.startsWith("/admin/blog-categories");

            if (isBlogsRoute) {
                return NextResponse.next(); // allowed
            }

            // Not allowed
            return NextResponse.redirect(new URL("/unauthorized", request.url));
        }

        // Any other role (like affiliate) trying admin → blocked
        return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // ================= AFFILIATE ROUTES ====================
    if (isAffiliateRoute) {
        if (!token) {
            return NextResponse.redirect(new URL(ROUTES.AFFILIATE.LOGIN, request.url));
        }

        // Only affiliate has access
        if (role !== "affiliate") {
            return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
    }

    // Add pathname to request headers
    const response = NextResponse.next()
    response.headers.set('x-pathname', pathname)

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
