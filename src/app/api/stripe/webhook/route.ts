import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { pushExternalItemsForOrder } from "@/lib/orderPush";

// ─────────────────────────────────────────────────────────────────────────────
// Stripe webhook — production-safe pipeline.
//
//   Verify signature
//     → Claim event.id (ProcessedStripeEvent, UNIQUE)  ── replay protection
//        already processed? → 200 (no reprocessing)
//     → Update payment status in the DB (NO Shopify/network call here)
//     → Mark event processed
//     → Fire-and-forget the Shopify/Woo push (idempotent; cron is the backstop)
//     → Return 200 immediately
//
// EVENT → ACTION MAP (documented):
//   payment_intent.succeeded      → order = "paid"        + queue push
//   checkout.session.completed    → order = "paid"        + queue push  (only if payment_status === "paid")
//   payment_intent.processing     → order = "processing"  + NO push
//   payment_intent.payment_failed → order = "failed"      + NO push
//   (any other type)              → ignored (acked)
// ─────────────────────────────────────────────────────────────────────────────

/** Mark the order(s) behind a PaymentIntent as paid. Returns their ids (to push). */
async function markPaidByPaymentIntent(pi: any): Promise<number[]> {
  const orderId = pi?.metadata?.orderId;
  if (orderId && orderId !== "pending" && !isNaN(Number(orderId))) {
    await prisma.orders.update({
      where: { id: Number(orderId) },
      data: { status: "paid", transactionId: pi.id, paymentMethod: "stripe" },
    });
    return [Number(orderId)];
  }
  // Fallback: the order stores the PaymentIntent id as transactionId.
  await prisma.orders.updateMany({
    where: { transactionId: pi.id },
    data: { status: "paid", paymentMethod: "stripe" },
  });
  const rows = await prisma.orders.findMany({
    where: { transactionId: pi.id },
    select: { id: true },
  });
  return rows.map((o: { id: number }) => o.id);
}

/** Apply a verified Stripe event to the DB. Returns order ids that should be pushed. */
async function applyEvent(event: any): Promise<number[]> {
  switch (event.type) {
    case "payment_intent.succeeded":
      return markPaidByPaymentIntent(event.data.object);

    case "checkout.session.completed": {
      const s = event.data.object;
      if (s?.payment_status !== "paid") return []; // async payment not yet settled
      const piId =
        typeof s?.payment_intent === "string" ? s.payment_intent : s?.payment_intent?.id;
      const orderId = s?.metadata?.orderId;
      if (orderId && orderId !== "pending" && !isNaN(Number(orderId))) {
        await prisma.orders.update({
          where: { id: Number(orderId) },
          data: { status: "paid", paymentMethod: "stripe", ...(piId ? { transactionId: piId } : {}) },
        });
        return [Number(orderId)];
      }
      if (piId) {
        await prisma.orders.updateMany({
          where: { transactionId: piId },
          data: { status: "paid", paymentMethod: "stripe" },
        });
        const rows = await prisma.orders.findMany({
          where: { transactionId: piId },
          select: { id: true },
        });
        return rows.map((o: { id: number }) => o.id);
      }
      return [];
    }

    case "payment_intent.processing": {
      const pi = event.data.object;
      // Do NOT mark paid and do NOT push — payment is still in flight.
      await prisma.orders.updateMany({
        where: { transactionId: pi.id },
        data: { status: "processing" },
      });
      return [];
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object;
      await prisma.orders.updateMany({
        where: { transactionId: pi.id },
        data: { status: "failed" },
      });
      return [];
    }

    default:
      return []; // ignored event type — still acked so Stripe stops retrying
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  // 1. VERIFY SIGNATURE — authenticates that Stripe sent this payload.
  let event: any;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 }); // 400 → Stripe retries
  }

  // 2. REPLAY PROTECTION — atomically claim event.id. Stripe re-signs retries with
  //    the SAME event.id, so a duplicate delivery hits the UNIQUE constraint.
  let claimed = true;
  try {
    await prisma.processedStripeEvent.create({
      data: { eventId: event.id, eventType: event.type },
    });
  } catch (e: any) {
    if (e?.code !== "P2002") {
      console.error("[stripe.webhook] event persist failed:", e?.message);
      return NextResponse.json({ error: "event persistence failed" }, { status: 500 }); // retry
    }
    claimed = false; // row already exists (duplicate delivery, or a crashed prior attempt)
  }

  if (!claimed) {
    // If the prior attempt fully processed it, ack and stop. If it was claimed but
    // never processed (process crashed mid-flight), fall through and reprocess —
    // safe because every applyEvent action is idempotent.
    const existing = await prisma.processedStripeEvent.findUnique({
      where: { eventId: event.id },
      select: { processedAt: true },
    });
    if (existing?.processedAt) {
      return NextResponse.json({ received: true, duplicate: true });
    }
  }

  // 3. APPLY EVENT (DB only — no Shopify/network call inside the request).
  let orderIds: number[] = [];
  try {
    orderIds = await applyEvent(event);
    await prisma.processedStripeEvent.update({
      where: { eventId: event.id },
      data: { processedAt: new Date() },
    });
  } catch (e: any) {
    // Release the claim so Stripe's retry can reprocess.
    if (claimed) {
      await prisma.processedStripeEvent.delete({ where: { eventId: event.id } }).catch(() => {});
    }
    console.error("[stripe.webhook] processing error:", e?.message);
    return NextResponse.json({ error: "processing failed" }, { status: 500 }); // retry
  }

  // 4. QUEUE PUSH — fire-and-forget so the response is not blocked on Shopify.
  //    Idempotent (externalOrderId + claim-first OrderMap); the durable cron
  //    /api/cron/push-pending-external re-runs anything that doesn't finish here.
  for (const id of orderIds) {
    void pushExternalItemsForOrder(id).catch((err) =>
      console.error("[stripe.webhook] async push failed (cron will retry):", id, (err as Error).message)
    );
  }

  // 5. RETURN 200 IMMEDIATELY.
  return NextResponse.json({ received: true });
}
