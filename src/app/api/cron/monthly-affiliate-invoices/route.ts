import { NextRequest, NextResponse } from "next/server";
import { generateMonthlyAffiliateInvoices } from "@/lib/services/affiliateInvoiceGenerator";

export async function GET(req: NextRequest) {
  // Only the scheduler (holding CRON_SECRET) may trigger invoice generation
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await generateMonthlyAffiliateInvoices();
  return NextResponse.json({ success: true, message: "Monthly invoices generated." });
}
