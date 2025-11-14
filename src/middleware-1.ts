// import { getToken } from "next-auth/jwt";
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export async function middleware(req: NextRequest) {
//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//   const pathname = req.nextUrl.pathname;

//   // Allow public routes
//   if (pathname.startsWith("/admin/login")) {
//     if (token) {
//       // ✅ Redirect based on role after login
//       if (token.role === "admin") {
//         return NextResponse.redirect(new URL("/admin/dashboard", req.url));
//       }
//       if (token.role === "user") {
//         return NextResponse.redirect(new URL("/user/profile", req.url));
//       }
//     }
//     return NextResponse.next();
//   }

//   // 🛡 Protect admin routes
//   if (pathname.startsWith("/admin")) {
//     if (!token) return NextResponse.redirect(new URL("/admin/login", req.url));
//     if (token.role !== "admin") return NextResponse.redirect(new URL("/", req.url));
//   }

//   // 🛡 Protect user routes
//   if (pathname.startsWith("/user")) {
//     if (!token) return NextResponse.redirect(new URL("/admin/login", req.url));
//     if (token.role !== "user" && token.role !== "admin") {
//       return NextResponse.redirect(new URL("/", req.url));
//     }
//   }

//   return NextResponse.next();
// }

// // export const config = {
// //   matcher: ["/admin/:path*", "/user/:path*", "/admin/login"],
// // };


// if (pathname.startsWith("/content-manager")) {
//   if (token?.user?.role !== "content_manager") {
//     return NextResponse.redirect(new URL("/content-manager/login", req.url));
//   }
// }
