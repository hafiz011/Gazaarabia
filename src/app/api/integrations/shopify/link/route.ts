import { NextResponse } from "next/server";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";
import { performLink } from "@/lib/services/shopifyLinkService";

// Merchant-authenticated (JWT). Performs the actual store link after the merchant
// explicitly confirms. Enforces one-shop-per-business.
export async function POST(req: Request) {
  const userId = getUserIdFromToken(getTokenFromHeader(req) ?? "");
  if (!userId) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ ok: false, state: "invalid" }, { status: 400 });
  }

  const result = await performLink(userId, token);
  const status = result.ok
    ? 200
    : result.state === "linked_other"
      ? 409
      : result.state === "no_seller"
        ? 403
        : 400;

  return NextResponse.json(result, { status });
}
