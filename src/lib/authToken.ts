import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

/**
 * Extract JWT token from either Authorization header or Cookie
 */
export function getTokenFromHeader(req: Request): string | null {
  let token = null;
  // 1. Try Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // // 2. Try cookies if header not found
  // const cookieHeader = req.headers.get("cookie");
  // const token = cookieHeader
  //   ?.split("; ")
  //   .find((c) => c.startsWith("auth_token="))
  //   ?.split("=")[1];

  return token || null;
}

/**
 *  Decode and get the user ID from token
 */
export function getUserIdFromToken(token: string): number | null {
  try {
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    return decoded.id;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }

}


/**
 *  Middleware-like helper to check token and return user ID
 */
export async function checkAuth(req: NextRequest): Promise<number | null> {
  const token: any = getTokenFromHeader(req);
  const userId = getUserIdFromToken(token);
  if (!userId) return null;
  return userId;
}