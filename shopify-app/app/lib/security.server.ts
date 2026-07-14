import crypto from "crypto";

// Constant-time string compare (Phase 11) — no timing side-channel.
export function timingSafeEqualStr(a: string, b: string): boolean {
  const ab = Buffer.from(a ?? "");
  const bb = Buffer.from(b ?? "");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export function verifyInternalSecret(request: Request): boolean {
  const secret = process.env.GAZAARABIA_INTERNAL_SECRET ?? "";
  const provided = request.headers.get("x-internal-secret") ?? "";
  return Boolean(secret) && timingSafeEqualStr(provided, secret);
}
