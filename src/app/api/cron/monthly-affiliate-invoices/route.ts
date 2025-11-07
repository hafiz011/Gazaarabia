import { NextResponse } from "next/server";
import { generateMonthlyAffiliateInvoices } from "@/lib/services/affiliateInvoiceGenerator";

export async function GET() {
  await generateMonthlyAffiliateInvoices();
  return NextResponse.json({ success: true, message: "Monthly invoices generated." });
}
