import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { logTokenRefresh, logRateLimited } from "@/lib/authLogging";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // Rate limit: 10 refresh attempts per 5 minutes per IP (prevent token refresh spam)
    const rateLimitResult = await rateLimit(req, {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 10, // 10 attempts
      keyGenerator: (r) => `refresh:${getClientIp(r)}`, // Separate limit for refresh
    });

    if (!rateLimitResult.allowed) {
      logRateLimited(req, "refresh");
      return rateLimitResponse(rateLimitResult.resetTime);
    }

    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return NextResponse.json(
        { message: "Refresh token is required" },
        { status: 400 }
      );
    }

    // Verify refresh token signature
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;
    } catch (error) {
      logTokenRefresh(req, 0, false, "Invalid token signature");
      return NextResponse.json(
        { message: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    // Check if token exists in database and is not revoked
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { role: true, affiliate: { select: { id: true, type: true } } } } },
    });

    if (!storedToken || storedToken.isRevoked || new Date() > storedToken.expiresAt) {
      logTokenRefresh(req, decoded.id, false, "Token revoked or expired");
      return NextResponse.json(
        { message: "Refresh token is invalid or expired" },
        { status: 401 }
      );
    }

    const user = storedToken.user;

    // Issue new access token (1 hour)
    const newAccessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role.name,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    // Log successful token refresh
    logTokenRefresh(req, user.id, true);

    return NextResponse.json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role.name,
        affiliateId: user.role.name === "affiliate" ? user.affiliate?.id : null,
        affiliateType: user.role.name === "affiliate" ? user.affiliate?.type : null,
        stripeCustomerId: user.stripeCustomerId,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
