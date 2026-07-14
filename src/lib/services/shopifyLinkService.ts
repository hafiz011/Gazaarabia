import { prisma } from "@/lib/prisma";
import { verifyLinkToken } from "@/lib/helpers/shopifyLinkToken";

export type LinkState =
  | "available" //  token valid, shop free → can connect
  | "linked_you" //  already linked to this seller (idempotent success)
  | "linked_other" //  linked to a different business → block
  | "no_seller" //  logged-in user has no seller account
  | "invalid"; //  token missing/expired/forged

// Where the merchant is sent back to after linking — the embedded app re-loads,
// re-checks status, and shows "Connected". No manual refresh needed.
function buildReturnUrl(shop: string): string {
  const base = (process.env.SHOPIFY_APP_URL ?? "").replace(/\/+$/, "");
  return `${base}/?shop=${encodeURIComponent(shop)}`;
}

// Read-only evaluation used by the connect page to decide which screen to show.
export async function evaluateLink(
  userId: number,
  token: string
): Promise<{ state: LinkState; shop?: string; returnUrl?: string }> {
  const decoded = verifyLinkToken(token);
  if (!decoded) return { state: "invalid" };
  const { shop } = decoded;

  const seller = await prisma.seller.findUnique({
    where: { userId },
    select: { id: true, shopifyDomain: true },
  });
  if (!seller) return { state: "no_seller", shop };

  const returnUrl = buildReturnUrl(shop);

  // Duplicate prevention: a shop may only belong to one business.
  const other = await prisma.seller.findFirst({
    where: { shopifyDomain: shop, NOT: { id: seller.id } },
    select: { id: true },
  });
  if (other) return { state: "linked_other", shop, returnUrl };

  if (seller.shopifyDomain === shop) return { state: "linked_you", shop, returnUrl };

  return { state: "available", shop, returnUrl };
}

// Performs the link after explicit merchant confirmation. Idempotent.
export async function performLink(
  userId: number,
  token: string
): Promise<{ ok: boolean; state: LinkState; returnUrl?: string }> {
  const evaluated = await evaluateLink(userId, token);

  if (evaluated.state === "invalid") return { ok: false, state: "invalid" };
  if (evaluated.state === "no_seller") return { ok: false, state: "no_seller" };
  if (evaluated.state === "linked_other") {
    return { ok: false, state: "linked_other", returnUrl: evaluated.returnUrl };
  }

  // "available" or "linked_you" → ensure the connection exists.
  await prisma.seller.update({
    where: { userId },
    data: { shopifyDomain: evaluated.shop!, storeType: "shopify" },
  });

  return { ok: true, state: "linked_you", returnUrl: evaluated.returnUrl };
}
