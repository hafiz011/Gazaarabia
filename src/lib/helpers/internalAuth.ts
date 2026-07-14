import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

// Shared-secret auth for server-to-server calls from the Shopify app.
// Constant-time comparison (Milestone 4, Phase 11) — no timing side-channel.
export function verifyInternalSecret(req: Request): boolean {
  const secret = process.env.GAZAARABIA_INTERNAL_SECRET ?? "";
  const provided = req.headers.get("x-internal-secret") ?? "";
  if (!secret) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Combined guard for internal endpoints: timing-safe secret + lightweight rate
// limit (Phase 10). Returns a Response to reject with, or null to proceed.
export async function guardInternal(
  req: Request,
  name: string,
  maxPerMin = 300
): Promise<Response | null> {
  if (!verifyInternalSecret(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const rl = await rateLimit(req, {
    windowMs: 60_000,
    maxRequests: maxPerMin,
    keyGenerator: (r) => `${name}:${r.headers.get("x-forwarded-for") ?? "internal"}`,
  });
  if (!rl.allowed) return rateLimitResponse(rl.resetTime);
  return null;
}

// Map a Shopify shop domain (e.g. "acme.myshopify.com") to a gazaarabia seller.
// Requires the seller to have linked their store (seller.shopifyDomain === shop).
export async function resolveSellerByShop(shop: string) {
  if (!shop) return null;
  return prisma.seller.findFirst({
    where: { storeType: "shopify", shopifyDomain: shop },
    select: { id: true, commissionValue: true, lastSyncedAt: true },
  });
}
