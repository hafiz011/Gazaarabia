// Store-linking service.
//
// The app never sends the Shopify access token to Gazaarabia. To link a store we
// sign a short-lived token carrying only { shop, nonce, exp } with the shared
// secret; Gazaarabia verifies it, so it can trust which shop is being linked
// without any secret ever leaving this app.

import crypto from "crypto";

const API = (process.env.GAZAARABIA_API_URL ?? "").replace(/\/+$/, "");
// Public marketplace URL the merchant's browser is redirected to (falls back to API).
const APP = (process.env.GAZAARABIA_APP_URL ?? process.env.GAZAARABIA_API_URL ?? "").replace(/\/+$/, "");
const SECRET = process.env.GAZAARABIA_INTERNAL_SECRET ?? "";
const TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Sign a linking token for a shop (base64url(payload).base64url(hmac)).
export function createLinkToken(shop: string): string {
  const payload = {
    shop,
    nonce: crypto.randomBytes(8).toString("hex"),
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

// The Gazaarabia page the merchant is sent to in order to log in and authorise.
export function buildConnectUrl(shop: string): string {
  const token = createLinkToken(shop);
  return `${APP}/shopify/connect?token=${encodeURIComponent(token)}`;
}

// Ask Gazaarabia whether this shop is already linked, and when it last synced.
// Fails closed (linked: false) on any error so the UI can prompt to connect.
export async function getLinkStatus(
  shop: string
): Promise<{ linked: boolean; lastSyncedAt: string | null }> {
  if (!API || !SECRET) return { linked: false, lastSyncedAt: null };
  try {
    const res = await fetch(`${API}/api/integrations/shopify/link-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-internal-secret": SECRET },
      body: JSON.stringify({ shop }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { linked: false, lastSyncedAt: null };
    const data = await res.json();
    return { linked: Boolean(data?.linked), lastSyncedAt: data?.lastSyncedAt ?? null };
  } catch {
    return { linked: false, lastSyncedAt: null };
  }
}
