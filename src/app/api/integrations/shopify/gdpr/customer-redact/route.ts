import { NextResponse } from "next/server";
import { verifyInternalSecret } from "@/lib/helpers/internalAuth";

// GDPR: a merchant requested deletion of a customer's data (SLA: within 30 days).
// Anonymise/erase any PII gazaarabia holds for the identified customer.
export async function POST(req: Request) {
  if (!verifyInternalSecret(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { shop, payload } = await req.json();

  // TODO: erase/anonymise records matching payload.customer within 30 days.
  console.log("[shopify][gdpr] customers_redact", { shop, customer: payload?.customer });

  return NextResponse.json({ success: true });
}
