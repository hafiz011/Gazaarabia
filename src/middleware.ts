import { NextResponse } from "next/server";

export function middleware(req: any) {
    const url = req.nextUrl;
    const ref = url.searchParams.get("ref");

    if (ref) {
        const res = NextResponse.next();
        res.cookies.set("gaza_arabia_affiliate_ref", ref, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
        });
        return res;
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
