import { stripe } from "@/lib/stripe";

// ─────────────────────────────────────────────────────────────────────────────
// SERVER-SIDE payment verification.
//
// The browser must NEVER decide whether an order is paid. Every function here
// reads the payment state directly from the payment provider (Stripe / PayPal)
// and ignores whatever `paymentStatus` the client submitted. This is the single
// source of truth used by the checkout routes to set an order's status.
// ─────────────────────────────────────────────────────────────────────────────

export type VerifiedOrderStatus = "paid" | "processing" | "pending" | "failed";

/** Map a Stripe PaymentIntent status to our order status. */
function fromStripeStatus(s: string | null | undefined): VerifiedOrderStatus {
  switch (s) {
    case "succeeded":
      return "paid";
    case "processing":
      return "processing";
    case "canceled":
      return "failed";
    // requires_payment_method | requires_confirmation | requires_action | requires_capture
    default:
      return "pending";
  }
}

/**
 * Derive an order's status from the PAYMENT PROVIDER, not from the request body.
 * Returns "pending" whenever the payment cannot be positively verified as paid —
 * this can never over-claim payment, so it can never trigger a wrongful push.
 */
export async function deriveVerifiedOrderStatus(payment: {
  paymentMethod?: string | null;
  transactionId?: string | null;
}): Promise<VerifiedOrderStatus> {
  const method = (payment.paymentMethod || "").toLowerCase();
  const txn = payment.transactionId || null;

  if (method === "stripe") {
    if (!txn) return "pending";
    try {
      const pi = await stripe.paymentIntents.retrieve(txn);
      return fromStripeStatus(pi.status);
    } catch {
      // Cannot verify → never assume paid.
      return "pending";
    }
  }

  if (method === "paypal") {
    if (!txn || !process.env.PAYPAL_API || !process.env.PAYPAL_CLIENT_ID) return "pending";
    try {
      const auth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
      ).toString("base64");
      const res = await fetch(`${process.env.PAYPAL_API}/v2/checkout/orders/${txn}`, {
        headers: { Authorization: `Basic ${auth}` },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) return "pending";
      const data: any = await res.json();
      // A captured PayPal order is COMPLETED; APPROVED means authorized-not-captured.
      return data?.status === "COMPLETED" ? "paid" : "pending";
    } catch {
      return "pending";
    }
  }

  // Unknown / manual methods: never auto-mark paid from the browser.
  return "pending";
}

/** True for statuses that represent a confirmed, pushable payment. */
export function isPaidStatus(status: string | null | undefined): boolean {
  return (status || "").toLowerCase() === "paid";
}
