import { generateAffiliateInvoicePDF } from "@/lib/utils/generateAffiliateInvoice";
import { PrismaClient } from "@prisma/client";
const prisma: any = new PrismaClient();
export async function generateMonthlyAffiliateInvoices() {
    const now = new Date();
    const month = now.getMonth(); // 0-based: Jan = 0
    const year = now.getFullYear();

    const monthLabel = now.toLocaleString("default", { month: "long", year: "numeric" });
    // Example: "February 2025"

    // Fetch all active affiliates
    const affiliates = await prisma.affiliate.findMany({
        where: { isActive: true },
        select: {
            id: true,
            user: { select: { name: true, email: true } },
        },
    });

    for (const affiliate of affiliates) {
        // Check if invoice already exists for this month
        const existingInvoice = await prisma.affiliateInvoice.findFirst({
            where: {
                affiliateId: affiliate.id,
                monthLabel,
            },
        });

        if (existingInvoice) {
            //  Invoice already exists — skip (prevents duplicates)
            continue;
        }

        //  Get all unpaid orders for this affiliate for this month
        const orders = await prisma.orders.findMany({
            where: {
                affiliateId: affiliate.id,
                affiliatePaid: false,
                createdAt: {
                    gte: new Date(year, month, 1),
                    lt: new Date(year, month + 1, 1),
                },
            },
            select: {
                id: true,
                createdAt: true,
                itemsTotal: true,
                couponDiscount: true,

                couponCode: true,
                coupon: {
                    select: {
                        discountType: true,
                        discountValue: true,
                    },
                },

                affiliateCommission: true,
                affiliateEarning: true,
            },
        });

        //  No unpaid orders this month → no invoice needed
        if (orders.length === 0) continue;

        //  Calculate total payout
        const totalAmount = orders.reduce(
            (sum: any, o: any) => sum + (o.affiliateEarning ?? 0),
            0
        );

        // Create invoice number (example: AFF-17-202502)
        const invoiceNumber = `AFF-${affiliate.id}-${year}${String(month + 1).padStart(2, "0")}`;

        //  Generate PDF (now includes breakdown table)
        const invoiceUrl = await generateAffiliateInvoicePDF({
            affiliateName: affiliate.user.name,
            affiliateEmail: affiliate.user.email,
            payoutAmount: totalAmount,
            paymentMethod: "Pending",
            paymentRef: "Pending",
            payoutDate: monthLabel,
            invoiceNumber,
            orders, // Pass breakdown to PDF
        });

        // save invoice record
        await prisma.affiliateInvoice.create({
            data: {
                affiliateId: affiliate.id,
                invoiceNumber,
                invoiceUrl,
                monthLabel,
                totalAmount,
            },
        });
    }

    return { success: true, message: "Monthly invoices generated successfully." };
}
