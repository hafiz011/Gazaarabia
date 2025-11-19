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


        // Fetch pending refunded items (order-level affiliate)
        const pendingRefunds = await prisma.orderItem.findMany({
            where: {
                order: { affiliateId: affiliate.id },
                returnStatus: "refunded",
                affiliateCommissionAdjusted: false,
            },
            select: {
                id: true,
                refundedAmount: true,
                price: true,
                quantity: true,
                order: {
                    select: {
                        itemsTotal: true,
                        affiliateEarning: true,
                    }
                }
            }
        });


        //  No unpaid orders this month → no invoice needed
        if (orders.length === 0) continue;

        //  Calculate total payout
        const earningsThisMonth = orders.reduce(
            (sum: any, o: any) => sum + (o.affiliateEarning ?? 0),
            0
        );

        const deductionAmount = pendingRefunds.reduce((sum: any, item: any) => {
            const refunded = item.refundedAmount || 0;
            const orderTotal = item.order.itemsTotal || 1;
            const originalEarn = item.order.affiliateEarning || 0;

            return sum + (refunded / orderTotal) * originalEarn;
        }, 0);

        let totalAmount = earningsThisMonth - deductionAmount;
        if (totalAmount < 0) totalAmount = 0;

        // Create invoice number (example: AFF-17-202502)
        const invoiceNumber = `AFF-${affiliate.id}-${year}${String(month + 1).padStart(2, "0")}`;

        //  Generate PDF (now includes breakdown table)
        const invoiceUrl = await generateAffiliateInvoicePDF({
            affiliateName: affiliate.user.name,
            affiliateEmail: affiliate.user.email,
            payoutAmount: totalAmount,
            deductionAmount,
            paymentMethod: "Pending",
            paymentRef: "Pending",
            payoutDate: monthLabel,
            invoiceNumber,
            orders, // Pass breakdown to PDF
        });


        if (pendingRefunds.length > 0) {
            await prisma.orderItem.updateMany({
                where: { id: { in: pendingRefunds.map((i: any) => i.id) } },
                data: { affiliateCommissionAdjusted: true },
            });
        }


        // save invoice record
        await prisma.affiliateInvoice.create({
            data: {
                affiliateId: affiliate.id,
                invoiceNumber,
                invoiceUrl,
                monthLabel,
                totalAmount,
                deductionAmount
            },
        });
    }

    return { success: true, message: "Monthly invoices generated successfully." };
}
