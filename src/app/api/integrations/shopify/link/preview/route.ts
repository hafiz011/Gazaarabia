import { NextResponse } from "next/server";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";
import { evaluateLink } from "@/lib/services/shopifyLinkService";

// Merchant-authenticated (JWT). Returns which screen the connect page should show
// without mutating anything.
export async function POST(req: Request) {
  const userId = getUserIdFromToken(getTokenFromHeader(req) ?? "");
  if (!userId) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ state: "invalid" }, { status: 400 });
  }

  const result = await evaluateLink(userId, token);
  const status =
    result.state === "invalid" ? 400 : result.state === "no_seller" ? 403 : 200;

  return NextResponse.json(result, { status });
}
