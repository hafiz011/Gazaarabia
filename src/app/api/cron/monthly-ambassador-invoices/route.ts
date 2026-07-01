import { NextRequest, NextResponse } from "next/server";
import { generateMonthlyAmbassadorInvoices } from "@/lib/services/ambassadorInvoiceGenerator";

export async function GET(req: NextRequest) {
    // Only the scheduler (holding CRON_SECRET) may trigger invoice generation
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await generateMonthlyAmbassadorInvoices();
    return NextResponse.json({ success: true, message: "Ambassador invoices generated." });
}
