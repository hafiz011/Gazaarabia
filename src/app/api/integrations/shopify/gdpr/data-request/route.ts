import { NextResponse } from "next/server";
import { verifyInternalSecret } from "@/lib/helpers/internalAuth";

// GDPR: a merchant requested a customer's data (SLA: provide within 30 days).
// gazaarabia is the data controller for marketplace orders; gather any data held
// for the identified customer and deliver it out-of-band. The webhook itself must
// just acknowledge quickly.
export async function POST(req: Request) {
  if (!verifyInternalSecret(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { shop, payload } = await req.json();

  // TODO: queue a data export for payload.customer (email / id) and fulfil within
  // 30 days. gazaarabia typically holds little/no Shopify-store customer data.
  console.log("[shopify][gdpr] data_request", { shop, customer: payload?.customer });

  return NextResponse.json({ success: true });
}
