import { NextResponse } from "next/server";
import { generateMonthlyAmbassadorInvoices } from "@/lib/services/ambassadorInvoiceGenerator";

export async function GET() {
    await generateMonthlyAmbassadorInvoices();
    return NextResponse.json({ success: true, message: "Ambassador invoices generated." });
}
