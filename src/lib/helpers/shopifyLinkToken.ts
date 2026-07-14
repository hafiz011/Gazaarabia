import crypto from "crypto";

// Verifies the short-lived linking token minted by the Shopify app.
// The token is base64url(payload).base64url(hmac) signed with the shared secret,
// and carries only { shop, nonce, exp } — never a Shopify access token.
export function verifyLinkToken(token: string): { shop: string } | null {
  try {
    const secret = process.env.GAZAARABIA_INTERNAL_SECRET;
    if (!secret || !token) return null;

    const [body, sig] = token.split(".");
    if (!body || !sig) return null;

    const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload?.shop || !payload?.exp || Date.now() > Number(payload.exp)) return null;

    return { shop: String(payload.shop) };
  } catch {
    return null;
  }
}
